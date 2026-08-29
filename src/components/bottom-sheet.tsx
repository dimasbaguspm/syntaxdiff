import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/button";

export function BottomSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-h-[88vh] overflow-auto rounded-t-2xl border-t border-edge bg-surface p-5 shadow-[var(--shadow)] animate-sheet-in"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-edge-strong" aria-hidden />
        <div className="mb-4 flex items-center justify-between border-b border-edge pb-3">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close" className="p-1.5">
            <X className="size-5" aria-hidden />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
