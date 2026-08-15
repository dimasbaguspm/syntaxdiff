import { useStore } from "../store";
import { SAMPLES } from "../samples";

export function InputPane() {
  const a = useStore((s) => s.a);
  const b = useStore((s) => s.b);
  const setA = useStore((s) => s.setA);
  const setB = useStore((s) => s.setB);

  const swap = () => {
    setA(b);
    setB(a);
  };

  return (
    <section className="inputs">
      <div className="pane">
        <label className="pane-label">Source A</label>
        <textarea
          value={a}
          onChange={(e) => setA(e.target.value)}
          placeholder="Paste A…"
          spellCheck={false}
        />
      </div>
      <div className="pane-actions">
        <button className="ghost" onClick={swap} title="Swap A and B">
          ⇄
        </button>
        <button
          className="ghost"
          onClick={() => {
            setA(SAMPLES.a);
            setB(SAMPLES.b);
          }}
          title="Load sample"
        >
          Sample
        </button>
      </div>
      <div className="pane">
        <label className="pane-label">Source B</label>
        <textarea
          value={b}
          onChange={(e) => setB(e.target.value)}
          placeholder="Paste B…"
          spellCheck={false}
        />
      </div>
    </section>
  );
}
