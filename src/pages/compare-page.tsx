import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Braces,
  ChevronRight,
  Code2,
  ShieldCheck,
  SlidersHorizontal,
  Wand2,
  WrapText,
} from "lucide-react";
import { adapters, autoDetect, getAdapter } from "@/engine";
import type { LanguageId } from "@/engine";
import { useStore } from "@/store";
import { saveDiff } from "@/db";
import { createDiffClient } from "@/worker/client";
import { TogglesPanel } from "@/components/toggles-panel";
import { Modal } from "@/components/modal";
import { btnPrimary, Spinner } from "@/components/ui";
import { escapeJsonString, looksEscaped, unescapeJsonString } from "@/lib/text-ops";

const client = createDiffClient();
const iconBtn = "rounded p-1 text-dim transition-colors hover:bg-surface-2 hover:text-ink";

function Pane({
  label,
  value,
  onChange,
  placeholder,
  wrap,
  onToggleWrap,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  wrap: boolean;
  onToggleWrap: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-well">
      <div className="flex shrink-0 items-center gap-1 border-b border-edge bg-surface-2 px-2 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-dim">
          <Braces className="size-3.5" aria-hidden />
          {label}
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          {children}
          <button
            type="button"
            onClick={onToggleWrap}
            title={wrap ? "Unwrap" : "Wrap"}
            aria-label={wrap ? "Unwrap" : "Wrap"}
            className={iconBtn}
          >
            <WrapText className="size-4" aria-hidden />
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className={`min-h-0 w-full flex-1 resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-ink placeholder-faint focus:outline-none ${
          wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
        }`}
      />
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
  const [wrapA, setWrapA] = useState(false);
  const [wrapB, setWrapB] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const adapter = useMemo(
    () => (lang === "auto" ? autoDetect(a || b) : getAdapter(lang as LanguageId)),
    [lang, a, b],
  );

  const validate = (value: string) => {
    try {
      adapter.format(value, opts);
      showSnack(`Valid ${adapter.label}`, "success");
    } catch (e) {
      showSnack(`Invalid ${adapter.label}: ${(e as Error).message}`, "error");
    }
  };

  const formatPane = (set: (v: string) => void, value: string) => {
    try {
      set(adapter.format(value, opts).canonical);
      showSnack(`Formatted as ${adapter.label}`, "success");
    } catch (e) {
      showSnack((e as Error).message, "error");
    }
  };

  const escapeToggle = (set: (v: string) => void, value: string) => {
    if (looksEscaped(value)) {
      set(unescapeJsonString(value));
      showSnack("Unescaped JSON", "success");
    } else {
      set(escapeJsonString(value));
      showSnack("Escaped JSON", "success");
    }
  };

  const onCompare = async () => {
    runStart();
    try {
      const res = await client.diff({ a, b, lang: adapter.id, opts });
      const id = await saveDiff({
        createdAt: Date.now(),
        lang: res.language,
        opts,
        a,
        b,
        patch: res.patch,
        added: res.counts.added,
        removed: res.counts.removed,
      });
      runSuccess(res);
      navigate(`/diff/${id}`);
    } catch (e) {
      runError((e as Error).message);
    }
  };

  const paneButtons = (set: (v: string) => void, value: string) => (
    <>
      {adapter.id === "json" && (
        <button
          type="button"
          onClick={() => escapeToggle(set, value)}
          title={looksEscaped(value) ? "Unescape JSON" : "Escape JSON"}
          aria-label={looksEscaped(value) ? "Unescape JSON" : "Escape JSON"}
          className={iconBtn}
        >
          <Code2 className="size-4" aria-hidden />
        </button>
      )}
      <button
        type="button"
        onClick={() => validate(value)}
        title="Validate syntax"
        aria-label="Validate syntax"
        className={iconBtn}
      >
        <ShieldCheck className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => formatPane(set, value)}
        title="Format"
        aria-label="Format"
        className={iconBtn}
      >
        <Wand2 className="size-4" aria-hidden />
      </button>
    </>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-edge bg-surface/40 px-4 py-2">
        <label className="flex items-center gap-2 text-sm text-dim">
          Language
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as typeof lang)}
            className="rounded-lg border border-edge bg-well px-2 py-1.5 text-sm text-ink focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <option value="auto">Auto — detected: {adapter.label}</option>
            {adapters.map((ad) => (
              <option key={ad.id} value={ad.id}>
                {ad.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => setOptionsOpen(true)}
          title="Options"
          aria-label="Options"
          className={iconBtn}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
        </button>

        <button
          type="button"
          onClick={onCompare}
          disabled={status === "running" || !a || !b}
          className={`${btnPrimary} ml-auto`}
        >
          {status === "running" ? <Spinner /> : null}
          {status === "running" ? "Diffing…" : "Compare"}
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 gap-px bg-edge">
        <Pane
          label="Source A"
          value={a}
          onChange={setA}
          placeholder="Paste source A…"
          wrap={wrapA}
          onToggleWrap={() => setWrapA((w) => !w)}
        >
          {paneButtons(setA, a)}
        </Pane>
        <Pane
          label="Source B"
          value={b}
          onChange={setB}
          placeholder="Paste source B…"
          wrap={wrapB}
          onToggleWrap={() => setWrapB((w) => !w)}
        >
          {paneButtons(setB, b)}
        </Pane>
      </div>

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
