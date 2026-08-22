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
          className="select-none overflow-hidden border-r border-edge bg-surface/40 py-4 pr-2 pl-2 text-right font-mono text-xs leading-[1.5] text-faint"
        >
          {Array.from({ length: lineCount }, (_, i) => i + 1).map((n) => (
            <div key={n} className="gutter-line">
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
        placeholder={placeholder}
        spellCheck={false}
        className={`min-h-0 w-full flex-1 resize-none bg-transparent py-4 pr-4 pl-3 font-mono text-xs leading-[1.5] text-ink placeholder-faint focus:outline-none ${
          wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
        }`}
      />
    </div>
  );
}
