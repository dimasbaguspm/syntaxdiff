import { useEffect, useRef, useState } from "react";
import { Braces } from "lucide-react";
import type { DiffLine, LanguageId } from "@/modules/engine/lib/types";
import type { ViewMode } from "@/core/store";
import { useGutterWidth } from "@/hooks/use-gutter-width";
import { Icon } from "@/modules/engine/ui/language-icon";
import { SplitPanes } from "@/components/split-panes";
import { ROW_H, useViewportHeight, windowSlice } from "@/modules/diff/lib/windowing";

function Pane({
  label,
  lines,
  side,
  icon,
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
  /** Optional language id for the Material Symbols pane icon. */
  icon?: LanguageId;
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
        {icon ? (
          <Icon name={icon} className="size-3.5 shrink-0 opacity-80" />
        ) : (
          <Braces className="size-3.5 shrink-0" aria-hidden="true" />
        )}
        {label}
      </div>
      <div ref={scrollRef} onScroll={onScroll} className="dv-scroll min-h-0 flex-1 overflow-auto">
        <div className="dv-body" style={{ paddingTop: padTop, paddingBottom: padBottom }}>
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
  icon,
  navIndex,
  navStarts,
}: {
  lines: DiffLine[];
  labelA: string;
  labelB: string;
  icon?: LanguageId;
  navIndex?: number | null;
  navStarts?: readonly number[];
}) {
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const viewportH = useViewportHeight(aRef);
  useGutterWidth(aRef, ".dv-gutter");
  const { start, end, padTop, padBottom } = windowSlice(lines.length, scrollTop, viewportH);

  const syncFrom = (from: "a" | "b") => {
    const src = from === "a" ? aRef.current : bRef.current;
    const dst = from === "a" ? bRef.current : aRef.current;
    if (src && dst) {
      dst.scrollTop = src.scrollTop;
      setScrollTop(src.scrollTop);
    }
  };

  // Change navigation: scroll BOTH pane containers to the active group's
  // first line (fixed ROW_H keeps the mapping exact). Also runs on mount
  // after a view toggle so the selection carries across split/unified.
  useEffect(() => {
    if (navIndex === null || navIndex === undefined) return;
    const top = (navStarts?.[navIndex] ?? 0) * ROW_H;
    for (const el of [aRef.current, bRef.current]) {
      if (el) el.scrollTop = top;
    }
  }, [navIndex, navStarts]);

  return (
    <SplitPanes
      left={
        <Pane
          label={labelA}
          lines={lines}
          side="a"
          icon={icon}
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
          icon={icon}
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

function UnifiedView({
  lines,
  navIndex,
  navStarts,
}: {
  lines: DiffLine[];
  navIndex?: number | null;
  navStarts?: readonly number[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const viewportH = useViewportHeight(ref);
  useGutterWidth(ref, ".dv-gutter");
  const { start, end, padTop, padBottom } = windowSlice(lines.length, scrollTop, viewportH);
  const slice = lines.slice(start, end);

  // Change navigation (single container — see SplitView note).
  useEffect(() => {
    if (navIndex === null || navIndex === undefined || !ref.current) return;
    ref.current.scrollTop = (navStarts?.[navIndex] ?? 0) * ROW_H;
  }, [navIndex, navStarts]);

  return (
    <div
      ref={ref}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      className="u-scroll min-h-0 flex-1 overflow-auto"
    >
      <div className="u-body" style={{ paddingTop: padTop, paddingBottom: padBottom }}>
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

/** Renders a persisted diff result as a split or unified, windowed view. */
export function DiffView({
  lines,
  mode,
  labelA = "Source A",
  labelB = "Source B",
  icon,
  navIndex = null,
  navStarts,
}: {
  lines: DiffLine[];
  mode: ViewMode;
  labelA?: string;
  labelB?: string;
  /** Optional language id for the Material Symbols pane icon. */
  icon?: LanguageId;
  /** Active change-group index to scroll to; null = no navigation yet. */
  navIndex?: number | null;
  /** Start line index of each change group (see computeChangeGroups). */
  navStarts?: readonly number[];
}) {
  return (
    <div className="diff-view flex min-h-0 min-w-0 flex-1 flex-col bg-well">
      {mode === "split" ? (
        <SplitView
          lines={lines}
          labelA={labelA}
          labelB={labelB}
          icon={icon}
          navIndex={navIndex}
          navStarts={navStarts}
        />
      ) : (
        <UnifiedView lines={lines} navIndex={navIndex} navStarts={navStarts} />
      )}
    </div>
  );
}
