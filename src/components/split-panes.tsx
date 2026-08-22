import { useRef, useState, type ReactNode } from "react";

export type Orientation = "horizontal" | "vertical";

/**
 * Two resizable panes split by a draggable divider.
 *
 * - `orientation="horizontal"` (default): desktop is a horizontal split
 *   (drag left/right); on mobile (window.innerWidth < 768) it auto-stacks
 *   vertically for touch ergonomics. Used by both the diff page and the
 *   entry/compare page (Source A beside Source B on desktop).
 * - `orientation="vertical"`: always a vertical stack (drag up/down).
 */
export function SplitPanes({
  left,
  right,
  orientation = "horizontal",
}: {
  left: ReactNode;
  right: ReactNode;
  orientation?: Orientation;
}) {
  const [ratio, setRatio] = useState(0.5);
  // State (not just a ref) so the drag-shield overlay mounts/unmounts with
  // the gesture — see regression note above the overlay in the JSX below.
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Track WHICH pointer started the drag: pointerup/cancel of any other pointer
  // (e.g. a second finger resting on a pane) must not end the gesture.
  const activePointer = useRef<number | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (activePointer.current !== null) return;
    activePointer.current = e.pointerId;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (activePointer.current !== e.pointerId) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Explicit "vertical" always stacks; "horizontal" stacks only on mobile
    // (window.innerWidth < 768), matching the touch-friendly fallback.
    const vertical =
      orientation === "vertical" ||
      (orientation === "horizontal" && typeof window !== "undefined" && window.innerWidth < 768);
    const size = vertical ? rect.height : rect.width;
    if (size === 0) return;
    const pos = vertical ? e.clientY - rect.top : e.clientX - rect.left;
    // Clamp lets a pane shrink to roughly its header-only size (~5%).
    setRatio(Math.min(0.95, Math.max(0.05, pos / size)));
  };

  const stopDrag = (e: React.PointerEvent) => {
    // Only the initiating pointer ends the drag; a second finger lifting or
    // being cancelled elsewhere must not abort the gesture.
    if (activePointer.current !== e.pointerId) return;
    activePointer.current = null;
    setDragging(false);
  };

  const pane = (basis: string) => ({
    flexBasis: basis,
    flexGrow: 0,
    flexShrink: 0,
  });

  // Layout + divider styling per orientation.
  const isVertical = orientation === "vertical";
  const containerClassName = isVertical
    ? "flex min-h-0 flex-1 flex-col"
    : "flex min-h-0 flex-1 flex-col md:flex-row";
  // A vertical split is resized up/down, so the separator is a horizontal bar.
  const dividerClassName = isVertical
    ? "relative z-10 flex h-4 w-full shrink-0 cursor-row-resize touch-none select-none items-center justify-center bg-edge transition-colors hover:bg-edge-strong"
    : "relative z-10 flex h-4 shrink-0 cursor-row-resize touch-none select-none items-center justify-center bg-edge transition-colors hover:bg-edge-strong md:h-auto md:w-2 md:cursor-col-resize";
  const dividerHandleClassName = isVertical
    ? "h-0.5 w-10 rounded-full bg-edge-strong"
    : "h-0.5 w-10 rounded-full bg-edge-strong md:h-10 md:w-0.5";
  // aria-orientation describes the divider's axis: a horizontal bar that moves
  // up/down is "horizontal"; a vertical bar that moves left/right is "vertical".
  const ariaOrientation = isVertical ? "horizontal" : "vertical";
  const shieldClassName = isVertical
    ? "fixed inset-0 z-20 cursor-row-resize touch-none select-none"
    : "fixed inset-0 z-20 cursor-row-resize touch-none select-none md:cursor-col-resize";

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      onPointerMove={onPointerMove}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
    >
      {/*
        Regression note (PR #6 mobile bug — divider draggable on the diff page
        but not on the compare/entry page):
        Pointer capture alone did not keep the gesture alive on mobile. As the
        finger travelled off the 8px divider onto the panes, the entry page's
        editable <textarea>s (unlike the diff page's read-only line divs)
        handed the gesture to the text-selection/caret machinery, which fired
        pointercancel and killed the drag before ratio ever updated. While a
        drag is active we mount this transparent, fullscreen touch-none shield
        so no editable/scrollable surface sits under the finger and the pointer
        stream runs to completion on BOTH pages. Desktop behaviour is unchanged:
        the shield only exists mid-drag and is visually inert.
      */}
      {dragging && <div aria-hidden className={shieldClassName} />}
      <div className="flex min-h-0 min-w-0 flex-col" style={pane(`${ratio * 100}%`)}>
        {left}
      </div>
      <div
        role="separator"
        aria-orientation={ariaOrientation}
        onPointerDown={onPointerDown}
        className={dividerClassName}
      >
        <span className={dividerHandleClassName} aria-hidden />
      </div>
      <div className="flex min-h-0 min-w-0 flex-col" style={pane(`${(1 - ratio) * 100}%`)}>
        {right}
      </div>
    </div>
  );
}
