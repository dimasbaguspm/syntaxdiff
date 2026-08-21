import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/button";

export function Modal({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-edge-strong bg-surface p-5 shadow-[var(--shadow)]">
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
