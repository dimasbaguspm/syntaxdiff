import { useEffect, useRef, useState } from "react";
import { Braces } from "lucide-react";
import type { DiffLine } from "../engine";
import type { ViewMode } from "../store";
import { SplitPanes } from "./split-panes";

/** Fixed diff row height (12px * line-height 1.5) — required for windowing.
 *  Must stay in sync with `--dv-row` height in index.css. */
const ROW_H = 18;
const OVERSCAN = 8;

function windowSlice(count: number, scrollTop: number, viewportH: number) {
  const start = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN);
  const end = Math.min(count, Math.ceil((scrollTop + viewportH) / ROW_H) + OVERSCAN);
  return { start, end, padTop: start * ROW_H, padBottom: Math.max(0, (count - end) * ROW_H) };
}

/** Track a scroll container's height (for windowing). */
function useViewportHeight(ref: React.RefObject<HTMLDivElement | null>): number {
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

function Pane({
  label,
  lines,
  side,
  scrollRef,
  onScroll,
  start,
  end,
  padTop,
  padBottom,
}: {
  label: string;
  lines: DiffLine[];
  side: "a" | "b";
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  start: number;
  end: number;
  padTop: number;
  padBottom: number;
}) {
  const slice = lines.slice(start, end);
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-1.5 border-b border-edge bg-surface-2 px-3 py-1.5 text-xs font-medium text-dim">
        <Braces className="size-3.5" aria-hidden />
        {label}
      </div>
      <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-auto">
        <div style={{ paddingTop: padTop, paddingBottom: padBottom }}>
          {slice.map((ln, i) => {
            const isA = side === "a";
            const text = isA ? ln.a : ln.b;
            const num = isA ? ln.aNum : ln.bNum;
            const kind =
              text === null
                ? "empty"
                : isA
                  ? ln.kind === "del"
                    ? "del"
                    : "ctx"
                  : ln.kind === "add"
                    ? "add"
                    : "ctx";
            const segs = (isA ? ln.aSeg : ln.bSeg) ?? null;
            return (
              <div key={start + i} className={`dv-row ${kind}`}>
                <span className="dv-gutter">{num ?? ""}</span>
                <span className="dv-line">
                  {segs && segs.length > 0
                    ? segs.map((s, j) => (
                        <span key={j} className={`inl-${s.kind}`}>
                          {s.text}
                        </span>
                      ))
                    : (text ?? "")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SplitView({
  lines,
  labelA,
  labelB,
}: {
  lines: DiffLine[];
  labelA: string;
  labelB: string;
}) {
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const viewportH = useViewportHeight(aRef);
  const { start, end, padTop, padBottom } = windowSlice(lines.length, scrollTop, viewportH);

  const syncFrom = (from: "a" | "b") => {
    const src = from === "a" ? aRef.current : bRef.current;
    const dst = from === "a" ? bRef.current : aRef.current;
    if (src && dst) {
      dst.scrollTop = src.scrollTop;
      setScrollTop(src.scrollTop);
    }
  };

  return (
    <SplitPanes
      left={
        <Pane
          label={labelA}
          lines={lines}
          side="a"
          scrollRef={aRef}
          onScroll={() => syncFrom("a")}
          start={start}
          end={end}
          padTop={padTop}
          padBottom={padBottom}
        />
      }
      right={
        <Pane
          label={labelB}
          lines={lines}
          side="b"
          scrollRef={bRef}
          onScroll={() => syncFrom("b")}
          start={start}
          end={end}
          padTop={padTop}
          padBottom={padBottom}
        />
      }
    />
  );
}

function UnifiedView({ lines }: { lines: DiffLine[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const viewportH = useViewportHeight(ref);
  const { start, end, padTop, padBottom } = windowSlice(lines.length, scrollTop, viewportH);
  const slice = lines.slice(start, end);

  return (
    <div
      ref={ref}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      className="min-h-0 flex-1 overflow-auto"
    >
      <div style={{ paddingTop: padTop, paddingBottom: padBottom }}>
        {slice.map((ln, i) => {
          const marker = ln.kind === "add" ? "+" : ln.kind === "del" ? "−" : " ";
          const num = ln.kind === "add" ? ln.bNum : ln.aNum;
          const segs = ln.kind === "add" ? ln.bSeg : ln.kind === "del" ? ln.aSeg : null;
          return (
            <div key={start + i} className={`u-row ${ln.kind}`}>
              <span className="dv-marker">{marker}</span>
              <span className="dv-gutter">{num ?? ""}</span>
              <span className="dv-line">
                {segs && segs.length > 0
                  ? segs.map((s, j) => (
                      <span key={j} className={`inl-${s.kind}`}>
                        {s.text}
                      </span>
                    ))
                  : (ln.a ?? ln.b ?? "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DiffView({
  lines,
  mode,
  labelA = "Source A",
  labelB = "Source B",
}: {
  lines: DiffLine[];
  mode: ViewMode;
  labelA?: string;
  labelB?: string;
}) {
  return (
    <div className="diff-view flex min-h-0 min-w-0 flex-1 flex-col bg-well">
      {mode === "split" ? (
        <SplitView lines={lines} labelA={labelA} labelB={labelB} />
      ) : (
        <UnifiedView lines={lines} />
      )}
    </div>
  );
}
