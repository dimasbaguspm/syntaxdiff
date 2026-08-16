import type { LanguageAdapter } from "../engine";
import { useStore } from "../store";
import { Switch } from "./switch";

export function TogglesPanel({ adapter }: { adapter: LanguageAdapter }) {
  const opts = useStore((s) => s.opts);
  const setOpt = useStore((s) => s.setOpt);

  return (
    <div className="flex flex-col gap-3">
      {adapter.toggles.length === 0 ? (
        <span className="text-xs text-faint">No options for {adapter.label}.</span>
      ) : (
        adapter.toggles.map((t) => {
          const checked = opts[t.id] ?? t.default ?? false;
          return (
            <label key={t.id} className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-sm text-ink">{t.label}</span>
              <Switch checked={checked} onChange={(v) => setOpt(t.id, v)} />
            </label>
          );
        })
      )}
    </div>
  );
}
