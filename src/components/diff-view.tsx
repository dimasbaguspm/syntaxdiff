import { html } from "diff2html";
import "diff2html/bundles/css/diff2html.min.css";
import type { ViewMode } from "../store";

interface DiffViewProps {
  patch: string;
  mode: ViewMode;
}

export function DiffView({ patch, mode }: DiffViewProps) {
  const rendered = html(patch, {
    drawFileList: false,
    matching: "lines",
    outputFormat: mode === "split" ? "side-by-side" : "line-by-line",
  });

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      {mode === "split" && (
        <div className="flex shrink-0 items-stretch border-b border-edge bg-surface-2 text-xs font-medium text-dim">
          <span className="flex-1 px-3 py-1.5">Source A</span>
          <span className="flex-1 border-l border-edge px-3 py-1.5">Source B</span>
        </div>
      )}
      <div
        className="diff-body min-h-0 flex-1 overflow-auto rounded-lg border border-edge bg-well"
        dangerouslySetInnerHTML={{ __html: rendered }}
      />
    </section>
  );
}
