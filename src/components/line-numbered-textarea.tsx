import { useMemo, useRef } from "react";

export function LineNumberedTextarea({
  value,
  onChange,
  placeholder,
  wrap = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  wrap?: boolean;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const lineCount = useMemo(() => value.split("\n").length, [value]);

  const syncScroll = () => {
    if (gutterRef.current && taRef.current) {
      gutterRef.current.scrollTop = taRef.current.scrollTop;
    }
  };

  return (
    <div className="flex min-h-0 w-full flex-1 overflow-hidden">
      {!wrap && (
        <div
          ref={gutterRef}
          aria-hidden
          className="select-none overflow-hidden border-r border-edge bg-surface/40 py-0 pl-2 pr-2 text-right font-mono text-xs leading-[1.5] text-faint"
          style={{ minWidth: "2.5rem" }}
        >
          {Array.from({ length: lineCount }, (_, i) => i + 1).map((n) => (
            <div key={n} className="gutter-line" style={{ height: "18px" }}>
              {n}
            </div>
          ))}
        </div>
      )}
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        // Allow file drops over the textarea to bubble to the parent Pane's
        // onDrop handler. onDragOver prevents the browser from rejecting the
        // drop; onDrop preventDefault stops the textarea's native file action
        // (insert path / open file) so the event reaches the parent reader.
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        placeholder={placeholder}
        spellCheck={false}
        className={`min-h-0 w-full flex-1 resize-none bg-transparent py-0 pl-3 pr-4 font-mono text-xs leading-[1.5] text-ink placeholder-faint focus:outline-none ${
          wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
        }`}
        style={{ lineHeight: "18px" }}
      />
    </div>
  );
}
