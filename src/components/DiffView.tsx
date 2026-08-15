import { html } from "diff2html";
import "diff2html/bundles/css/diff2html.min.css";
import type { ViewMode } from "../store";

interface DiffViewProps {
  patch: string;
  mode: ViewMode;
  counts: { added: number; removed: number };
}

export function DiffView({ patch, mode, counts }: DiffViewProps) {
  const rendered = html(patch, {
    drawFileList: false,
    matching: "lines",
    outputFormat: mode === "split" ? "side-by-side" : "line-by-line",
  });

  return (
    <section className="diff">
      <div className="stats">
        <span className="stat add">+{counts.added} added</span>
        <span className="stat del">−{counts.removed} removed</span>
      </div>
      <div className="diff-body" dangerouslySetInnerHTML={{ __html: rendered }} />
    </section>
  );
}
