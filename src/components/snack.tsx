import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useStore, type SnackType } from "@/core/store";

const STYLE: Record<SnackType, string> = {
  info: "border-[var(--tint-sky-bd)] bg-[var(--tint-sky-bg)] text-[var(--tint-sky-fg)]",
  success:
    "border-[var(--tint-emerald-bd)] bg-[var(--tint-emerald-bg)] text-[var(--tint-emerald-fg)]",
  error: "border-[var(--tint-rose-bd)] bg-[var(--tint-rose-bg)] text-[var(--tint-rose-fg)]",
};

const ICON = { info: Info, success: CheckCircle2, error: AlertTriangle };

/** Persistent snack message with a dismiss button (no auto-hide). */
export function Snack() {
  const snack = useStore((s) => s.snack);
  const dismiss = useStore((s) => s.dismissSnack);
  if (!snack) return null;
  const Icon = ICON[snack.type];
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-16 z-40 flex justify-center px-4">
      <div
        role="status"
        className={`pointer-events-auto flex max-w-md items-start gap-2 rounded-lg border px-4 py-3 font-mono text-sm shadow-[var(--shadow)] backdrop-blur ${STYLE[snack.type]}`}
      >
        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p className="min-w-0 flex-1 break-words">{snack.message}</p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          title="Dismiss"
          className="shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
