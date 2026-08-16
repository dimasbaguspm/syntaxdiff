import { useMemo, useState, type ReactNode } from "react";
import { marked } from "marked";
import { Search } from "lucide-react";
import changelogRaw from "../../CHANGELOG.md?raw";
import { Modal } from "./modal";

function highlight(text: string, query: string): ReactNode {
  if (!query) return text;
  const q = query.toLowerCase();
  const lower = text.toLowerCase();
  const parts: ReactNode[] = [];
  let i = 0;
  let idx: number;
  while ((idx = lower.indexOf(q, i)) !== -1) {
    if (idx > i) parts.push(text.slice(i, idx));
    parts.push(<mark key={idx}>{text.slice(idx, idx + q.length)}</mark>);
    i = idx + q.length;
  }
  if (i < text.length) parts.push(text.slice(i));
  return parts;
}

function countMatches(text: string, query: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  let c = 0;
  let i = 0;
  while ((i = text.toLowerCase().indexOf(q, i)) !== -1) {
    c++;
    i += q.length;
  }
  return c;
}

export function ChangelogModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const html = useMemo(() => marked.parse(changelogRaw, { async: false }) as string, []);
  const matches = useMemo(() => countMatches(changelogRaw, query), [query]);

  return (
    <Modal open={open} title="Changelog" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search changelog…"
            aria-label="Search changelog"
            className="w-full rounded-lg border border-edge bg-well py-1.5 pl-9 pr-3 text-sm text-ink focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </label>
        <p className="text-xs text-faint">
          {matches} match{matches === 1 ? "" : "es"}
        </p>
        <div className="max-h-[60vh] overflow-auto rounded-lg border border-edge bg-well p-4">
          {query ? (
            <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink">
              {highlight(changelogRaw, query)}
            </pre>
          ) : (
            <div className="md-body" dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>
      </div>
    </Modal>
  );
}
