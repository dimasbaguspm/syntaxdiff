import { useMemo } from "react";
import { adapters, autoDetect, getAdapter } from "./engine";
import type { LanguageId } from "./engine";
import { useStore } from "./store";
import { createDiffClient } from "./worker/client";
import { InputPane } from "./components/InputPane";
import { TogglesPanel } from "./components/TogglesPanel";
import { DiffView } from "./components/DiffView";

const client = createDiffClient();

export default function App() {
  const a = useStore((s) => s.a);
  const b = useStore((s) => s.b);
  const lang = useStore((s) => s.lang);
  const opts = useStore((s) => s.opts);
  const mode = useStore((s) => s.mode);
  const status = useStore((s) => s.status);
  const result = useStore((s) => s.result);
  const error = useStore((s) => s.error);
  const setLang = useStore((s) => s.setLang);
  const setMode = useStore((s) => s.setMode);
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
      runSuccess(res);
    } catch (e) {
      runError((e as Error).message);
    }
  };

  return (
    <main className="app">
      <header>
        <h1>SyntaxDiff</h1>
        <p className="tagline">
          Diff structure, not bytes. 100% client-side — nothing leaves your machine.
        </p>
      </header>

      <div className="toolbar">
        <label className="lang-picker">
          Language
          <select value={lang} onChange={(e) => setLang(e.target.value as typeof lang)}>
            <option value="auto">Auto — detected: {adapter.label}</option>
            {adapters.map((ad) => (
              <option key={ad.id} value={ad.id}>
                {ad.label}
              </option>
            ))}
          </select>
        </label>

        <div className="view-toggle">
          <button className={mode === "split" ? "active" : ""} onClick={() => setMode("split")}>
            Split
          </button>
          <button className={mode === "unified" ? "active" : ""} onClick={() => setMode("unified")}>
            Unified
          </button>
        </div>

        <button className="primary" onClick={onCompare} disabled={status === "running" || !a || !b}>
          {status === "running" ? "Diffing…" : "Compare"}
        </button>
      </div>

      <TogglesPanel adapter={adapter} />
      <InputPane />

      {status === "error" && <div className="error">⚠ {error}</div>}
      {status === "done" && result && (
        <DiffView patch={result.patch} mode={mode} counts={result.counts} />
      )}
    </main>
  );
}
