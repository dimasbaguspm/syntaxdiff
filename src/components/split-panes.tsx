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
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const pct = (e.clientX - rect.left) / rect.width;
    setRatio(Math.min(0.8, Math.max(0.2, pct)));
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
        className="relative z-10 h-1.5 shrink-0 cursor-row-resize touch-none bg-edge-strong transition-colors hover:bg-accent md:h-auto md:w-1 md:cursor-col-resize"
      />
      <div className="flex min-h-0 min-w-0 flex-col" style={pane(`${(1 - ratio) * 100}%`)}>
        {right}
      </div>
    </div>
  );
}
