import { clsx } from "clsx";
import { Button } from "@/components/button";

export function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Button
      variant="bare"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-edge transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40",
        checked ? "bg-accent" : "bg-edge-strong",
      )}
    >
      <span
        className={clsx(
          "inline-block size-4 rounded-full bg-canvas shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </Button>
  );
}
