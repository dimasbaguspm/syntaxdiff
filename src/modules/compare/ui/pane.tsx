import { useRef, type ReactNode } from "react";
import { useDropzone } from "react-dropzone";
import { AlignLeft, CheckCircle2, Loader2, Upload, XCircle } from "lucide-react";
import { useCompare, type Side } from "@/modules/compare/providers/context";
import { Icon } from "@/modules/engine/ui/language-icon";
import { trackEvent } from "@/modules/analytics/lib/track";
import { Button } from "@/components/button";
import { Tooltip } from "@/components/tooltip";
import { Spinner } from "@/components/ui";
import { LineNumberedTextarea } from "@/components/line-numbered-textarea";
import { TextInput } from "@/components/inputs";

const PLACEHOLDER: Record<Side, string> = {
  a: "Paste source A, or drop a file…",
  b: "Paste source B, or drop a file…",
};

/** Presentational source pane — all behaviour comes from the compare context. */
export function Pane({ side, children }: { side: Side; children?: ReactNode }) {
  const { getPane, formatSide, adapter, formatting } = useCompare();
  const pane = getPane(side);
  const inputRef = useRef<HTMLInputElement>(null);

  const read = (file: File | undefined, method: "drop" | "button") => {
    if (!file) return;
    if (method === "drop") trackEvent("compare_file_drop", { name: file.name, size: file.size });
    else trackEvent("compare_file_upload", { name: file.name, size: file.size });
    pane.onImportFile(file, method);
  };

  // react-dropzone owns the HTML5 drag/drop lifecycle on the whole pane root
  // (it correctly preventDefaults dragover/drop on the root, so a file dropped
  // anywhere — including over the nested textarea — fires onDrop). noClick so
  // the explicit Upload button (not the whole pane) opens the file dialog.
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    multiple: false,
    onDrop: (accepted) => read(accepted[0], "drop"),
  });

  const Root = getRootProps();
  return (
    <div
      {...Root}
      className={`relative flex min-h-0 min-w-0 flex-1 flex-col bg-well transition-colors ${
        isDragActive ? "outline-2 outline-accent/60" : ""
      }`}
    >
      {isDragActive && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-accent/70 bg-accent/10 text-ink">
          <Upload className="size-8 text-accent" aria-hidden />
          <span className="text-sm font-medium">Drop to import into {pane.label}</span>
        </div>
      )}
      <div className="flex shrink-0 items-center gap-1 border-b border-edge bg-surface-2 px-2 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-dim">
          <Icon name={pane.icon} className="size-3.5 shrink-0 opacity-80" />
          <TextInput
            value={pane.label}
            onChange={(e) => pane.onLabelChange(e.target.value)}
            aria-label="Source label"
            placeholder="Source label"
            className="min-w-0 max-w-[10rem] flex-1 text-xs font-medium"
          />
          {pane.status === "valid" && (
            <CheckCircle2 className="size-3 text-[var(--tint-emerald-fg)]" aria-hidden />
          )}
          {pane.status === "invalid" && (
            <XCircle className="size-3 text-[var(--tint-rose-fg)]" aria-hidden />
          )}
          {pane.status === "loading" && (
            <Loader2 className="size-3 animate-spin text-accent" aria-hidden />
          )}
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          <input {...getInputProps()} ref={inputRef} />
          <Tooltip label="Upload / drop a file">
            <Button
              variant="ghost"
              onClick={() => open()}
              aria-label="Upload a file into this source"
              className="p-1"
            >
              <Upload className="size-4" aria-hidden />
            </Button>
          </Tooltip>
          <Tooltip label={adapter.formatterDisabled ? "Formatting unavailable" : "Format"}>
            <Button
              variant="ghost"
              onClick={() => formatSide(side)}
              aria-label="Format"
              className="p-1"
              disabled={adapter.formatterDisabled || formatting[side]}
            >
              {formatting[side] ? <Spinner /> : <AlignLeft className="size-4" aria-hidden />}
            </Button>
          </Tooltip>
          {children}
        </div>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-well">
        <LineNumberedTextarea
          value={pane.value}
          onChange={pane.onChange}
          placeholder={PLACEHOLDER[side]}
        />
      </div>
    </div>
  );
}
