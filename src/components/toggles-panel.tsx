import type { LanguageAdapter } from "@/modules/engine/lib";
import { useStore } from "@/core/store";
import { trackEvent } from "@/modules/analytics/lib/track";
import { Switch } from "@/components/switch";

export function TogglesPanel({ adapter }: { adapter: LanguageAdapter }) {
  const opts = useStore((s) => s.opts);
  const setOpt = useStore((s) => s.setOpt);

  return (
    <div className="flex flex-col gap-3">
      {adapter.toggles.length === 0 ? (
        <span className="text-xs text-faint">No options for {adapter.label}.</span>
      ) : (
        adapter.toggles.map((t) => {
          if (t.type === "select") {
            const value = (opts[t.id] as string) ?? t.default ?? t.options?.[0] ?? "";
            return (
              <label
                key={t.id}
                className="flex items-center justify-between gap-3"
                htmlFor={`opt-${t.id}`}
              >
                <span className="text-sm text-ink">{t.label}</span>
                <select
                  id={`opt-${t.id}`}
                  value={value}
                  onChange={(e) => {
                    const v = e.target.value;
                    setOpt(t.id, v);
                    trackEvent("option_change", { id: t.id, value: v });
                  }}
                  className="rounded-lg border border-edge bg-well px-2 py-1 text-sm text-ink focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  {t.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
            );
          }
          const checked = (opts[t.id] as boolean) ?? t.default ?? false;
          return (
            <label key={t.id} className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-sm text-ink">{t.label}</span>
              <Switch
                checked={checked}
                onChange={(v) => {
                  setOpt(t.id, v);
                  trackEvent("option_change", { id: t.id, value: String(v) });
                }}
              />
            </label>
          );
        })
      )}
    </div>
  );
}
