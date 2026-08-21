import { useEffect, useState } from "react";

/** Fixed diff row height (12px * line-height 1.5) — required for windowing.
 *  Must stay in sync with `--dv-row` height in index.css. */
export const ROW_H = 18;
export const OVERSCAN = 8;

export interface WindowSlice {
  start: number;
  end: number;
  padTop: number;
  padBottom: number;
}

/** Compute the visible row window for a scroll position + viewport height. */
export function windowSlice(count: number, scrollTop: number, viewportH: number): WindowSlice {
  const start = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN);
  const end = Math.min(count, Math.ceil((scrollTop + viewportH) / ROW_H) + OVERSCAN);
  return { start, end, padTop: start * ROW_H, padBottom: Math.max(0, (count - end) * ROW_H) };
}

/** Track a scroll container's height (for windowing). */
export function useViewportHeight(ref: React.RefObject<HTMLElement | null>): number {
  const [h, setH] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver !== "function") return;
    const ro = new ResizeObserver(() => setH(el.clientHeight));
    ro.observe(el);
    setH(el.clientHeight);
    return () => ro.disconnect();
  }, [ref]);
  return h;
}
