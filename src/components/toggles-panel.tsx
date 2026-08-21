import type { LanguageAdapter } from "@/modules/engine/lib";
import { useStore } from "@/core/store";
import { trackEvent } from "@/modules/analytics/lib/track";
import { SelectInput, SwitchInput } from "@/components/inputs";

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
                <SelectInput
                  id={`opt-${t.id}`}
                  value={value}
                  onChange={(e) => {
                    const v = e.target.value;
                    setOpt(t.id, v);
                    trackEvent("option_change", { id: t.id, value: v });
                  }}
                >
                  {t.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </SelectInput>
              </label>
            );
          }
          const checked = (opts[t.id] as boolean) ?? t.default ?? false;
          return (
            <SwitchInput
              key={t.id}
              checked={checked}
              onChange={(v) => {
                setOpt(t.id, v);
                trackEvent("option_change", { id: t.id, value: String(v) });
              }}
              label={t.label}
            />
          );
        })
      )}
    </div>
  );
}
