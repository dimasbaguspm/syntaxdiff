import { SlidersHorizontal } from "lucide-react";
import type { LanguageAdapter } from "../engine";
import { useStore } from "../store";

export function TogglesPanel({ adapter }: { adapter: LanguageAdapter }) {
  const opts = useStore((s) => s.opts);
  const setOpt = useStore((s) => s.setOpt);

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-edge bg-surface px-3 py-2">
      <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-dim">
        <SlidersHorizontal className="size-3.5" aria-hidden />
        {adapter.label} options
      </span>
      {adapter.toggles.length === 0 ? (
        <span className="text-xs text-faint">No options for {adapter.label}.</span>
      ) : (
        adapter.toggles.map((t) => {
          const checked = opts[t.id] ?? t.default ?? false;
          return (
            <label
              key={t.id}
              className="flex cursor-pointer items-center gap-1.5 text-xs text-dim transition-colors hover:text-ink"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setOpt(t.id, e.target.checked)}
                className="size-3.5 rounded border-edge bg-well accent-accent"
              />
              {t.label}
            </label>
          );
        })
      )}
    </div>
  );
}
