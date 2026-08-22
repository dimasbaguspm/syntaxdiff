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
    // scrim: same on every breakpoint, closes on tap
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      {/*
        Responsive shell:
        - mobile (< md): bottom sheet — full width, anchored to the bottom,
          rounded top corners, slides up via the sheet-in keyframes.
        - desktop (md+): centered dialog card (original look), fades/scales in.
        Switching a quick DevTools responsive flip keeps the right one because
        the layout is driven purely by the md: breakpoint classes.
      */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          "w-full max-w-lg border border-edge-strong bg-surface shadow-[var(--shadow)]",
          // mobile bottom sheet: fixed to the bottom edge (inset-x-0 bottom-0)
          "fixed inset-x-0 bottom-0 max-h-[90vh] overflow-auto rounded-t-2xl border-b-0 p-5 animate-sheet-in",
          // desktop centered modal: static inside the flex-centered scrim
          "md:inset-auto md:static md:max-h-none md:rounded-xl md:border-b md:p-5 md:animate-modal-in",
        ].join(" ")}
      >
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
