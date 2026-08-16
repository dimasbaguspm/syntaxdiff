import type { DiffLine } from "../engine";
import type { ViewMode } from "../store";

interface DiffViewProps {
  lines: DiffLine[];
  mode: ViewMode;
}

/** Describe one side of a row for the split (side-by-side) view. */
function side(line: DiffLine, s: "a" | "b") {
  const isA = s === "a";
  const text = isA ? line.a : line.b;
  const num = isA ? line.aNum : line.bNum;
  const kind =
    text === null
      ? "empty"
      : line.kind === "del"
        ? isA
          ? "del"
          : "ctx"
        : line.kind === "add"
          ? isA
            ? "ctx"
            : "add"
          : "ctx";
  return { text: text ?? "", num, kind };
}

function Cell({ text, num, kind }: { text: string; num: number | null; kind: string }) {
  return (
    <div className={`dv-cell ${kind}`}>
      <span className="dv-gutter">{num ?? ""}</span>
      <span className="dv-line">{text}</span>
    </div>
  );
}

function SplitView({ lines }: { lines: DiffLine[] }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-stretch border-b border-edge bg-surface-2 text-xs font-medium text-dim">
        <span className="flex-1 px-3 py-1.5">Source A</span>
        <span className="flex-1 border-l border-edge px-3 py-1.5">Source B</span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {lines.map((ln, i) => (
          <div key={i} className="dv-row grid grid-cols-2">
            <Cell {...side(ln, "a")} />
            <Cell {...side(ln, "b")} />
          </div>
        ))}
      </div>
    </div>
  );
}

function UnifiedView({ lines }: { lines: DiffLine[] }) {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      {lines.map((ln, i) => {
        const marker = ln.kind === "add" ? "+" : ln.kind === "del" ? "−" : " ";
        const num = ln.kind === "add" ? ln.bNum : ln.aNum;
        return (
          <div key={i} className={`dv-row u-row ${ln.kind}`}>
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
    <div className="diff-view flex min-h-0 min-w-0 flex-1 flex-col">
      {mode === "split" ? <SplitView lines={lines} /> : <UnifiedView lines={lines} />}
    </div>
  );
}
