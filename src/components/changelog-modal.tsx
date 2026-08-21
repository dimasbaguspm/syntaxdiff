import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import changelogRaw from "../../CHANGELOG.md?raw";
import { Modal } from "@/components/modal";

interface Section {
  heading: string;
  items: string[];
}

interface Entry {
  version: string;
  sections: Section[];
}

/** Split the markdown CHANGELOG into versioned entries with their sections. */
function parseChangelog(raw: string): Entry[] {
  const entries: Entry[] = [];
  let cur: Entry | null = null;
  for (const line of raw.split("\n")) {
    const vm = line.match(/^##\s+\[?v?(\d+\.\d+\.\d+)/);
    if (vm) {
      cur = { version: vm[1], sections: [] };
      entries.push(cur);
      continue;
    }
    if (!cur) continue;
    const sm = line.match(/^###\s+(.+)/);
    if (sm) {
      cur.sections.push({ heading: sm[1].trim(), items: [] });
      continue;
    }
    const bm = line.match(/^\s*[-*]\s+(.+)/);
    if (bm && cur.sections.length > 0) {
      cur.sections[cur.sections.length - 1].items.push(bm[1].trim());
    }
  }
  return entries;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

/** Wrap every match in a <mark>, keeping the rendered content intact. */
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
  const [versionFilter, setVersionFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  const entries = useMemo(() => parseChangelog(changelogRaw), []);
  const versions = useMemo(() => entries.map((e) => e.version), [entries]);
  const sources = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) for (const s of e.sections) set.add(s.heading);
    return [...set];
  }, [entries]);

  const html = useMemo(() => {
    const filtered = entries
      .filter((e) => !versionFilter || e.version === versionFilter)
      .map((e) => {
        const sections = e.sections.filter((s) => !sourceFilter || s.heading === sourceFilter);
        const body = sections
          .map(
            (s) =>
              `<h4>${escapeHtml(s.heading)}</h4>` +
              `<ul>${s.items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`,
          )
          .join("");
        return `<h3 class="changelog-version">v${escapeHtml(e.version)}</h3>${body}`;
      })
      .join("");
    return filtered;
  }, [entries, versionFilter, sourceFilter]);

  const matches = useMemo(() => countMatches(changelogRaw, query), [query]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.innerHTML = html;
    highlightInDom(el, query);
  }, [html, query, open]);

  const selectCls =
    "rounded-lg border border-edge bg-well px-2 py-1.5 text-sm text-ink focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20";

  return (
    <Modal open={open} title="Changelog" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative block min-w-0 flex-1">
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
          <select
            value={versionFilter}
            onChange={(e) => setVersionFilter(e.target.value)}
            aria-label="Filter by version"
            className={selectCls}
          >
            <option value="">All versions</option>
            {versions.map((v) => (
              <option key={v} value={v}>
                v{v}
              </option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            aria-label="Filter by source"
            className={selectCls}
          >
            <option value="">All sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-faint">
          {matches} match{matches === 1 ? "" : "es"}
        </p>
        <div className="max-h-[60vh] overflow-auto rounded-lg border border-edge bg-well p-4">
          {html ? (
            <div ref={bodyRef} className="md-body" />
          ) : (
            <p className="text-sm text-dim">No matching changelog entries.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
