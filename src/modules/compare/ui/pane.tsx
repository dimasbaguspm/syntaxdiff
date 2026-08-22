import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlignLeft, CheckCircle2, Loader2, Upload, XCircle } from "lucide-react";
import { useCompare, type Side } from "@/modules/compare/providers/context";
import { Icon } from "@/modules/engine/ui/language-icon";
import { Button } from "@/components/button";
import { Tooltip } from "@/components/tooltip";
import { Spinner } from "@/components/ui";
import { LineNumberedTextarea } from "@/components/line-numbered-textarea";
import { TextInput, HiddenInput } from "@/components/inputs";

const PLACEHOLDER: Record<Side, string> = {
  a: "Paste source A, or drop a file…",
  b: "Paste source B, or drop a file…",
};

/** Presentational source pane — all behaviour comes from the compare context. */
export function Pane({ side, children }: { side: Side; children?: ReactNode }) {
  const { getPane, formatSide, adapter, formatting } = useCompare();
  const pane = getPane(side);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);

  const read = (file: File | undefined, method: "drop" | "button") => {
    if (!file) return;
    pane.onImportFile(file, method);
  };

  // Native drag listeners on the container. React's synthetic drag events are
  // unreliable for native HTML5 drops on nested children (the browser only
  // allows a drop when dragover.preventDefault() ran on the element under the
  // cursor, which synthetic bubbling doesn't guarantee). Native listeners
  // attached directly to the container make the drop work regardless of which
  // child the file is released over.
  const readRef = useRef(read);
  readRef.current = read;
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onDragOver = (e: DragEvent) => e.preventDefault();
    const onDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragDepth.current += 1;
      setDragging(true);
    };
    const onDragLeave = () => {
      dragDepth.current -= 1;
      if (dragDepth.current <= 0) {
        dragDepth.current = 0;
        setDragging(false);
      }
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      const file = e.dataTransfer?.files?.[0];
      readRef.current(file, "drop");
    };
    el.addEventListener("dragover", onDragOver);
    el.addEventListener("dragenter", onDragEnter);
    el.addEventListener("dragleave", onDragLeave);
    el.addEventListener("drop", onDrop);
    return () => {
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("dragenter", onDragEnter);
      el.removeEventListener("dragleave", onDragLeave);
      el.removeEventListener("drop", onDrop);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex min-h-0 min-w-0 flex-1 flex-col bg-well transition-colors ${
        dragging ? "outline-2 outline-accent/60" : ""
      }`}
    >
      {dragging && (
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
          <Tooltip label="Upload / drop a file">
            <Button
              variant="ghost"
              onClick={() => inputRef.current?.click()}
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
        <HiddenInput
          ref={inputRef}
          type="file"
          accept=".csv,.json,.yaml,.yml,.toml,.xml,.sql,.txt,.log,text/plain,text/csv,application/json"
          onChange={(e) => {
            read(e.target.files?.[0], "button");
            e.target.value = "";
          }}
        />
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
