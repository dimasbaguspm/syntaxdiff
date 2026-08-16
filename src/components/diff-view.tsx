import { useRef } from "react";
import { Braces } from "lucide-react";
import type { DiffLine } from "../engine";
import type { ViewMode } from "../store";
import { SplitPanes } from "./split-panes";

interface DiffViewProps {
  lines: DiffLine[];
  mode: ViewMode;
}

/** One full-height scrollable diff pane (Source A or Source B). */
function DiffPane({
  label,
  lines,
  side,
  scrollRef,
  onScroll,
}: {
  label: string;
  lines: DiffLine[];
  side: "a" | "b";
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-1.5 border-b border-edge bg-surface-2 px-3 py-1.5 text-xs font-medium text-dim">
        <Braces className="size-3.5" aria-hidden />
        {label}
      </div>
      <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-auto">
        {lines.map((ln, i) => {
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
          return (
            <div key={i} className={`dv-row ${kind}`}>
              <span className="dv-gutter">{num ?? ""}</span>
              <span className="dv-line">{text ?? ""}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SplitView({ lines }: { lines: DiffLine[] }) {
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);
  const syncFrom = (from: "a" | "b") => {
    const src = from === "a" ? aRef.current : bRef.current;
    const dst = from === "a" ? bRef.current : aRef.current;
    if (src && dst) dst.scrollTop = src.scrollTop;
  };
  return (
    <SplitPanes
      left={
        <DiffPane
          label="Source A"
          lines={lines}
          side="a"
          scrollRef={aRef}
          onScroll={() => syncFrom("a")}
        />
      }
      right={
        <DiffPane
          label="Source B"
          lines={lines}
          side="b"
          scrollRef={bRef}
          onScroll={() => syncFrom("b")}
        />
      }
    />
  );
}

function UnifiedView({ lines }: { lines: DiffLine[] }) {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      {lines.map((ln, i) => {
        const marker = ln.kind === "add" ? "+" : ln.kind === "del" ? "−" : " ";
        const num = ln.kind === "add" ? ln.bNum : ln.aNum;
        return (
          <div key={i} className={`u-row ${ln.kind}`}>
            <span className="dv-marker">{marker}</span>
            <span className="dv-gutter">{num ?? ""}</span>
            <span className="dv-line">{ln.a ?? ln.b ?? ""}</span>
          </div>
        );
      })}
    </div>
  );
}

export function DiffView({ lines, mode }: DiffViewProps) {
  return (
    <div className="diff-view flex min-h-0 min-w-0 flex-1 flex-col bg-well">
      {mode === "split" ? <SplitView lines={lines} /> : <UnifiedView lines={lines} />}
    </div>
  );
}
