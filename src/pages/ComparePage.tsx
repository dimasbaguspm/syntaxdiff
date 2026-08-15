import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Braces, ChevronRight } from "lucide-react";
import { adapters, autoDetect, getAdapter } from "../engine";
import type { LanguageId } from "../engine";
import { useStore } from "../store";
import { saveDiff } from "../db";
import { createDiffClient } from "../worker/client";
import { TogglesPanel } from "../components/TogglesPanel";
import { btnPrimary, ErrorBanner, Spinner } from "../components/ui";

const client = createDiffClient();

function Pane({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-well">
      <div className="flex shrink-0 items-center justify-between border-b border-edge bg-surface-2 px-3 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-dim">
          <Braces className="size-3.5" aria-hidden />
          {label}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className="min-h-0 w-full flex-1 resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-ink placeholder-faint focus:outline-none"
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
  const error = useStore((s) => s.error);
  const setA = useStore((s) => s.setA);
  const setB = useStore((s) => s.setB);
  const setLang = useStore((s) => s.setLang);
  const runStart = useStore((s) => s.runStart);
  const runSuccess = useStore((s) => s.runSuccess);
  const runError = useStore((s) => s.runError);

  const adapter = useMemo(
    () => (lang === "auto" ? autoDetect(a || b) : getAdapter(lang as LanguageId)),
    [lang, a, b],
  );

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

        <TogglesPanel adapter={adapter} />

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
        <Pane label="Source A" value={a} onChange={setA} placeholder="Paste source A…" />
        <Pane label="Source B" value={b} onChange={setB} placeholder="Paste source B…" />
      </div>

      {status === "error" && (
        <div className="shrink-0 border-t border-edge px-4 py-2">
          <ErrorBanner message={error ?? ""} />
        </div>
      )}
    </div>
  );
}
