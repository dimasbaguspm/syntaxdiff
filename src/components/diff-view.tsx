import { html } from "diff2html";
import "diff2html/bundles/css/diff2html.min.css";
import { FileDiff } from "lucide-react";
import type { ViewMode } from "../store";

interface DiffViewProps {
  patch: string;
  mode: ViewMode;
  counts: { added: number; removed: number };
  wrap?: boolean;
}

export function DiffView({ patch, mode, counts, wrap = false }: DiffViewProps) {
  const rendered = html(patch, {
    drawFileList: false,
    matching: "lines",
    outputFormat: mode === "split" ? "side-by-side" : "line-by-line",
  });

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-sm font-medium text-dim">
          <FileDiff className="size-4" aria-hidden />
          Diff
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tint-emerald-bd)] bg-[var(--tint-emerald-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--tint-emerald-fg)]">
          +{counts.added} added
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tint-rose-bd)] bg-[var(--tint-rose-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--tint-rose-fg)]">
          −{counts.removed} removed
        </span>
      </div>
      <div
        className={`diff-body overflow-x-auto rounded-lg border border-edge bg-well ${
          wrap ? "diff-wrap" : ""
        }`}
        dangerouslySetInnerHTML={{ __html: rendered }}
      />
    </section>
  );
}
