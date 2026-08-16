import type { ReactNode } from "react";

/** Hover popup (CSS-only tooltip) for icon buttons. */
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-edge bg-surface-2 px-2 py-1 text-xs font-medium text-ink opacity-0 shadow-[var(--shadow)] transition-opacity duration-150 group-hover/tip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
