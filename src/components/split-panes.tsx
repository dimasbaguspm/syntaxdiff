import { useRef, useState, type ReactNode } from "react";

/**
 * Two resizable panes split by a draggable divider. On desktop the divider is
 * vertical (drag left/right); on mobile the layout stacks vertically.
 */
export function SplitPanes({ left, right }: { left: ReactNode; right: ReactNode }) {
  const [ratio, setRatio] = useState(0.5);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    // On mobile the layout is flex-col (stacks A over B), so drag is vertical.
    const vertical = typeof window !== "undefined" && window.innerWidth < 768;
    const size = vertical ? rect.height : rect.width;
    if (size === 0) return;
    const pos = vertical ? e.clientY - rect.top : e.clientX - rect.left;
    setRatio(Math.min(0.8, Math.max(0.2, pos / size)));
  };

  const stopDrag = () => {
    dragging.current = false;
  };

  const pane = (basis: string) => ({
    flexBasis: basis,
    flexGrow: 0,
    flexShrink: 0,
  });

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 flex-1 flex-col md:flex-row"
      onPointerMove={onPointerMove}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
    >
      <div className="flex min-h-0 min-w-0 flex-col" style={pane(`${ratio * 100}%`)}>
        {left}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        onPointerDown={onPointerDown}
        className="relative z-10 flex h-2 shrink-0 cursor-row-resize touch-none select-none items-center justify-center bg-edge transition-colors hover:bg-edge-strong md:h-auto md:w-2 md:cursor-col-resize"
      >
        <span className="h-0.5 w-10 rounded-full bg-edge-strong md:h-10 md:w-0.5" aria-hidden />
      </div>
      <div className="flex min-h-0 min-w-0 flex-col" style={pane(`${(1 - ratio) * 100}%`)}>
        {right}
      </div>
    </div>
  );
}
