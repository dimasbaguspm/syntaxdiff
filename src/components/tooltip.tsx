import { useRef, useState, type ReactNode } from "react";

/**
 * Hover popup (CSS-only tooltip). Auto-positions: shows below the trigger when
 * it sits near the top of the viewport, otherwise above, so it stays visible.
 */
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const [place, setPlace] = useState<"top" | "bottom">("top");
  const triggerRef = useRef<HTMLSpanElement>(null);

  const onEnter = () => {
    const el = triggerRef.current;
    if (el) {
      setPlace(el.getBoundingClientRect().top < 90 ? "bottom" : "top");
    }
  };

  return (
    <span ref={triggerRef} onMouseEnter={onEnter} className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-md border border-edge bg-surface-2 px-2 py-1 text-xs font-medium text-ink opacity-0 shadow-[var(--shadow)] transition-opacity duration-150 group-hover/tip:opacity-100 ${
          place === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
        }`}
      >
        {label}
      </span>
    </span>
  );
}
