import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Braces,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  SlidersHorizontal,
  Wand2,
  XCircle,
} from "lucide-react";
import { adapters, applyOptsDefaults, autoDetect, getAdapter } from "@/engine";
import type { FormatOptions, LanguageAdapter, LanguageId } from "@/engine";
import { useStore } from "@/store";
import { saveDiff } from "@/db";
import { createDiffClient } from "@/worker/client";
import { trackEvent } from "@/lib/analytics/track";
import { logError, logInfo } from "@/lib/analytics/otel";
import { TogglesPanel } from "@/components/toggles-panel";
import { Modal } from "@/components/modal";
import { Tooltip } from "@/components/tooltip";
import { SplitPanes } from "@/components/split-panes";
import { LineNumberedTextarea } from "@/components/line-numbered-textarea";
import { btnPrimary, Spinner } from "@/components/ui";

const client = createDiffClient();
const iconBtn = "rounded p-1 text-dim transition-colors hover:bg-surface-2 hover:text-ink";

type PaneStatus = "valid" | "invalid" | "idle";

/** Debounced live validation of a pane against the active adapter. */
function usePaneStatus(value: string, adapter: LanguageAdapter, opts: FormatOptions): PaneStatus {
  const [status, setStatus] = useState<PaneStatus>("idle");
  useEffect(() => {
    if (!value.trim()) {
      setStatus("idle");
      return;
    }
    const id = setTimeout(() => {
      try {
        adapter.format(value, opts);
        setStatus("valid");
      } catch {
        setStatus("invalid");
      }
    }, 350);
    return () => clearTimeout(id);
  }, [value, adapter, opts]);
  return status;
}

function Pane({
  label,
  value,
  onChange,
  placeholder,
  status,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  status: PaneStatus;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-well">
      <div className="flex shrink-0 items-center gap-1 border-b border-edge bg-surface-2 px-2 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-dim">
          <Braces className="size-3.5" aria-hidden />
          {label}
          {status === "valid" && (
            <CheckCircle2 className="size-3 text-[var(--tint-emerald-fg)]" aria-hidden />
          )}
          {status === "invalid" && (
            <XCircle className="size-3 text-[var(--tint-rose-fg)]" aria-hidden />
          )}
        </span>
        <div className="ml-auto flex items-center gap-0.5">{children}</div>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-well">
        <LineNumberedTextarea value={value} onChange={onChange} placeholder={placeholder} />
      </div>
    </div>
  );
}

export function ComparePage() {
  const navigate = useNavigate();
  const a = useStore((s) => s.a);
  const b = useStore((s) => s.b);
  const lang = useStore((s) => s.lang);
  const opts = useStore((s) => s.opts);
  const status = useStore((s) => s.status);
  const setA = useStore((s) => s.setA);
  const setB = useStore((s) => s.setB);
  const setLang = useStore((s) => s.setLang);
  const runStart = useStore((s) => s.runStart);
  const runSuccess = useStore((s) => s.runSuccess);
  const runError = useStore((s) => s.runError);
  const showSnack = useStore((s) => s.showSnack);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const adapter = useMemo(
    () => (lang === "auto" ? autoDetect(a || b) : getAdapter(lang as LanguageId)),
    [lang, a, b],
  );
  const eOpts = useMemo(() => applyOptsDefaults(adapter, opts), [adapter, opts]);
  const statusA = usePaneStatus(a, adapter, eOpts);
  const statusB = usePaneStatus(b, adapter, eOpts);

  const validate = (value: string) => {
    try {
      adapter.format(value, eOpts);
      showSnack(`Valid ${adapter.label}`, "success");
      logInfo("validate", { lang: adapter.id, ok: true });
      trackEvent("validate", { lang: adapter.id, ok: "true" });
    } catch (e) {
      showSnack(`Invalid ${adapter.label}: ${(e as Error).message}`, "error");
      logError(e, "validate failed", { lang: adapter.id });
      trackEvent("validate", { lang: adapter.id, ok: "false" });
    }
  };

  const formatPane = (set: (v: string) => void, value: string) => {
    try {
      set(adapter.format(value, eOpts).canonical);
      showSnack(`Formatted as ${adapter.label}`, "success");
      logInfo("format", { lang: adapter.id, ok: true });
      trackEvent("format", { lang: adapter.id, ok: "true" });
    } catch (e) {
      showSnack((e as Error).message, "error");
      logError(e, "format failed", { lang: adapter.id });
      trackEvent("format", { lang: adapter.id, ok: "false" });
    }
  };

  const onCompare = async () => {
    runStart();
    trackEvent("compare", { lang: adapter.id });
    try {
      const res = await client.diff({ a, b, lang: adapter.id, opts });
      const id = await saveDiff({
        createdAt: Date.now(),
        lang: res.language,
        opts,
        a,
        b,
        patch: res.patch,
        lines: res.lines,
        added: res.counts.added,
        removed: res.counts.removed,
      });
      runSuccess(res);
      logInfo("compare done", {
        lang: res.language,
        added: res.counts.added,
        removed: res.counts.removed,
      });
      trackEvent("compare_done", {
        added: res.counts.added,
        removed: res.counts.removed,
      });
      navigate(`/diff/${id}`);
    } catch (e) {
      runError((e as Error).message);
      logError(e, "compare failed", { lang: adapter.id });
      trackEvent("compare_error", { lang: adapter.id });
    }
  };

  const paneButtons = (set: (v: string) => void, value: string) => (
    <>
      <Tooltip label="Validate syntax">
        <button
          type="button"
          onClick={() => validate(value)}
          aria-label="Validate syntax"
          className={iconBtn}
        >
          <ShieldCheck className="size-4" aria-hidden />
        </button>
      </Tooltip>
      <Tooltip label="Format">
        <button
          type="button"
          onClick={() => formatPane(set, value)}
          aria-label="Format"
          className={iconBtn}
        >
          <Wand2 className="size-4" aria-hidden />
        </button>
      </Tooltip>
    </>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-edge bg-surface/40 px-4 py-2">
        <select
          value={lang}
          onChange={(e) => {
            const v = e.target.value as typeof lang;
            setLang(v);
            trackEvent("change_language", { lang: v });
          }}
          className="max-w-[10rem] rounded-lg border border-edge bg-well px-2 py-1.5 text-sm text-ink focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20 sm:max-w-[16rem]"
        >
          <option value="auto">Auto ({adapter.label})</option>
          {adapters.map((ad) => (
            <option key={ad.id} value={ad.id}>
              {ad.label}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <Tooltip label="Options">
            <button
              type="button"
              onClick={() => {
                setOptionsOpen(true);
                trackEvent("open_options");
              }}
              aria-label="Options"
              className={iconBtn}
            >
              <SlidersHorizontal className="size-4" aria-hidden />
            </button>
          </Tooltip>

          <Tooltip label="Compare">
            <button
              type="button"
              onClick={onCompare}
              disabled={status === "running" || !a || !b}
              aria-label="Compare"
              className={btnPrimary}
            >
              {status === "running" ? (
                <Spinner />
              ) : (
                <>
                  <span className="hidden sm:inline">Compare</span>
                  <ChevronRight className="size-4" aria-hidden />
                </>
              )}
            </button>
          </Tooltip>
        </div>
      </div>

      <SplitPanes
        left={
          <Pane
            label="Source A"
            value={a}
            onChange={setA}
            placeholder="Paste source A…"
            status={statusA}
          >
            {paneButtons(setA, a)}
          </Pane>
        }
        right={
          <Pane
            label="Source B"
            value={b}
            onChange={setB}
            placeholder="Paste source B…"
            status={statusB}
          >
            {paneButtons(setB, b)}
          </Pane>
        }
      />

      <Modal
        open={optionsOpen}
        title={`Options — ${adapter.label}`}
        onClose={() => setOptionsOpen(false)}
      >
        <TogglesPanel adapter={adapter} />
      </Modal>
    </div>
  );
}
