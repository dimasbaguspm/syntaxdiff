import type { LanguageAdapter } from "../engine";
import { useStore } from "../store";

export function TogglesPanel({ adapter }: { adapter: LanguageAdapter }) {
  const opts = useStore((s) => s.opts);
  const setOpt = useStore((s) => s.setOpt);

  if (adapter.toggles.length === 0) {
    return (
      <div className="toggles">
        <span className="muted">No options for {adapter.label}.</span>
      </div>
    );
  }

  return (
    <div className="toggles">
      <span className="toggles-label">{adapter.label} options</span>
      {adapter.toggles.map((t) => {
        const checked = opts[t.id] ?? t.default ?? false;
        return (
          <label key={t.id} className="toggle">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setOpt(t.id, e.target.checked)}
            />
            {t.label}
          </label>
        );
      })}
    </div>
  );
}
