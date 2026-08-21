import { useEffect } from "react";

/**
 * Measure the rendered gutter width (marker + line numbers) and expose it as
 * a CSS var on the scroll container, so the full-height stripe painted by
 * index.css always matches the real cells — including wide 5-digit numbers.
 */
export function useGutterWidth(
  scrollRef: React.RefObject<HTMLElement | null>,
  selector: string,
): void {
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const apply = () => {
      const cell = el.querySelector<HTMLElement>(selector);
      if (!cell) return;
      const w = cell.getBoundingClientRect().width;
      if (w > 0) el.style.setProperty("--dv-gutter-w", `${w}px`);
    };
    apply();
    if (typeof ResizeObserver !== "function") return;
    // Re-measure when the first row (and thus its gutter cell) changes size.
    const ro = new ResizeObserver(apply);
    const firstCell = el.querySelector(selector);
    if (firstCell) ro.observe(firstCell);
    return () => ro.disconnect();
  }, [scrollRef, selector]);
}
