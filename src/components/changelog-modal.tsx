import { useEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";
import { Search } from "lucide-react";
import changelogRaw from "../../CHANGELOG.md?raw";
import { Modal } from "./modal";

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

/** Wrap every match in a <mark>, keeping the rendered markdown intact. */
function highlightInDom(root: HTMLElement, query: string) {
  if (!query) return;
  const q = query.toLowerCase();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const text = node.nodeValue || "";
    const lower = text.toLowerCase();
    if (!lower.includes(q)) continue;
    const frag = document.createDocumentFragment();
    let i = 0;
    let idx: number;
    while ((idx = lower.indexOf(q, i)) !== -1) {
      if (idx > i) frag.appendChild(document.createTextNode(text.slice(i, idx)));
      const mark = document.createElement("mark");
      mark.textContent = text.slice(idx, idx + q.length);
      frag.appendChild(mark);
      i = idx + q.length;
    }
    if (i < text.length) frag.appendChild(document.createTextNode(text.slice(i)));
    node.parentNode?.replaceChild(frag, node);
  }
}

export function ChangelogModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const html = useMemo(() => marked.parse(changelogRaw, { async: false }) as string, []);
  const matches = useMemo(() => countMatches(changelogRaw, query), [query]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.innerHTML = html;
    highlightInDom(el, query);
  }, [html, query, open]);

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
          <div ref={bodyRef} className="md-body" />
        </div>
      </div>
    </Modal>
  );
}
