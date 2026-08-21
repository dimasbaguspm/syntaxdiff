import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlignLeft,
  Braces,
  CheckCircle2,
  ChevronRight,
  ScrollText,
  SlidersHorizontal,
  Upload,
  XCircle,
} from "lucide-react";
import { adapters, applyOptsDefaults, autoDetect, getAdapter } from "@/engine";
import type { FormatOptions, LanguageAdapter, LanguageId } from "@/engine";
import { useStore } from "@/store";
import { saveDiff } from "@/db";
import { createDiffClient } from "@/worker/client";
import { trackEvent } from "@/lib/analytics/track";
import { logError } from "@/lib/analytics/otel";
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

/** Map a file extension to a supported language id, or undefined. */
function languageFromExtension(name: string): LanguageId | undefined {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "json":
      return "json";
    case "yaml":
    case "yml":
      return "yaml";
    case "sql":
      return "sql";
    case "csv":
      return "csv";
    case "toml":
      return "toml";
    case "xml":
      return "xml";
    default:
      return undefined;
  }
}

function Pane({
  label,
  onLabelChange,
  value,
  onChange,
  placeholder,
  status,
  onImportFile,
  children,
}: {
  label: string;
  onLabelChange: (v: string) => void;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  status: PaneStatus;
  onImportFile: (file: File, method: "drop" | "button") => void;
  children?: ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const read = (file: File | undefined, method: "drop" | "button") => {
    if (!file) return;
    onImportFile(file, method);
  };

  return (
    <div
      className={`relative flex min-h-0 min-w-0 flex-1 flex-col bg-well transition-colors ${
        dragging ? "outline-2 outline-accent/60" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        read(e.dataTransfer.files?.[0], "drop");
      }}
    >
      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-accent/70 bg-accent/10 text-ink">
          <Upload className="size-8 text-accent" aria-hidden />
          <span className="text-sm font-medium">Drop to import into {label}</span>
        </div>
      )}
      <div className="flex shrink-0 items-center gap-1 border-b border-edge bg-surface-2 px-2 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-dim">
          <Braces className="size-3.5 shrink-0" aria-hidden />
          <input
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
            aria-label="Source label"
            placeholder="Source label"
            className="min-w-0 max-w-[10rem] flex-1 rounded bg-transparent px-1 text-xs font-medium text-ink outline-none focus:bg-surface hover:bg-surface/60"
          />
          {status === "valid" && (
            <CheckCircle2 className="size-3 text-[var(--tint-emerald-fg)]" aria-hidden />
          )}
          {status === "invalid" && (
            <XCircle className="size-3 text-[var(--tint-rose-fg)]" aria-hidden />
          )}
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          <Tooltip label="Upload / drop a file">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              aria-label="Upload a file into this source"
              className={iconBtn}
            >
              <Upload className="size-4" aria-hidden />
            </button>
          </Tooltip>
          {children}
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".csv,.json,.yaml,.yml,.toml,.xml,.sql,.txt,.log,text/plain,text/csv,application/json"
          onChange={(e) => {
            read(e.target.files?.[0], "button");
            e.target.value = "";
          }}
        />
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
  const labelA = useStore((s) => s.labelA);
  const labelB = useStore((s) => s.labelB);
  const setLabelA = useStore((s) => s.setLabelA);
  const setLabelB = useStore((s) => s.setLabelB);
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

  const importFile = (set: (v: string) => void, file: File, method: "drop" | "button") => {
    const ext = languageFromExtension(file.name);
    void file
      .text()
      .then((text) => {
        // Feed the same callback as paste/type so content-based auto-detection
        // runs exactly like manual input (no language forcing).
        set(text);
        trackEvent("import_file", { method, ext, lang: adapter.id, bytes: file.size });
        showSnack(`Imported ${file.name}`, "success");
      })
      .catch((e) => {
        showSnack(`Failed to read ${file.name}`, "error");
        logError(e, "import file failed", { name: file.name });
      });
  };

  const validate = (value: string) => {
    try {
      adapter.format(value, eOpts);
      showSnack(`Valid ${adapter.label}`, "success");
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
        labelA,
        labelB,
        patch: res.patch,
        lines: res.lines,
        added: res.counts.added,
        removed: res.counts.removed,
      });
      runSuccess(res);
      trackEvent("compare_done", {
        lang: res.language,
        added: res.counts.added,
        removed: res.counts.removed,
      });
      navigate(`/diff/${id}`);
    } catch (e) {
      runError((e as Error).message);
      logError(e, "compare failed", { lang: adapter.id });
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
          <ScrollText className="size-4" aria-hidden />
        </button>
      </Tooltip>
      <Tooltip label="Format">
        <button
          type="button"
          onClick={() => formatPane(set, value)}
          aria-label="Format"
          className={iconBtn}
        >
          <AlignLeft className="size-4" aria-hidden />
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
            label={labelA}
            onLabelChange={setLabelA}
            value={a}
            onChange={setA}
            placeholder="Paste source A, or drop a file…"
            status={statusA}
            onImportFile={(file, method) => importFile(setA, file, method)}
          >
            {paneButtons(setA, a)}
          </Pane>
        }
        right={
          <Pane
            label={labelB}
            onLabelChange={setLabelB}
            value={b}
            onChange={setB}
            placeholder="Paste source B, or drop a file…"
            status={statusB}
            onImportFile={(file, method) => importFile(setB, file, method)}
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
