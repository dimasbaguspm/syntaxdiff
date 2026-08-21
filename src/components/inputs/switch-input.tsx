import { clsx } from "clsx";
import { Switch } from "@/components/switch";

export interface SwitchInputProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  /** Optional visible label; when present the control is wrapped in a `<label>`. */
  label?: string;
  className?: string;
  id?: string;
}

/** Composes the existing accessible `Switch` with an optional label. */
export function SwitchInput({ checked, onChange, label, className, id }: SwitchInputProps) {
  const control = (
    <Switch
      checked={checked}
      onChange={onChange}
      {...(id ? { id } : {})}
      aria-label={label ?? undefined}
    />
  );
  if (!label) return <span className={className}>{control}</span>;
  return (
    <label className={clsx("flex cursor-pointer items-center justify-between gap-3", className)}>
      <span className="text-sm text-ink">{label}</span>
      {control}
    </label>
  );
}
