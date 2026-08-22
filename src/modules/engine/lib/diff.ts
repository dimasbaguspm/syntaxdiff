import { createTwoFilesPatch, diffLines, diffWordsWithSpace, type Change } from "diff";
import { getAdapter } from "@/modules/engine/lib/registry";
import type {
  DiffCounts,
  DiffLine,
  DiffResult,
  FormatOptions,
  InlineSegment,
  LanguageAdapter,
  LanguageId,
} from "@/modules/engine/lib/types";

/**
 * Fill in each adapter toggle's declared default (e.g. sortKeys: true) when the
 * caller hasn't set it, so the "smart" pre-processing (format + key sort) runs
 * by default — not only when the user manually toggles an option.
 */
export function applyOptsDefaults(adapter: LanguageAdapter, opts: FormatOptions): FormatOptions {
  const merged: FormatOptions = { ...opts };
  for (const t of adapter.toggles) {
    if (t.default !== undefined && merged[t.id] === undefined) merged[t.id] = t.default;
  }
  return merged;
}

/**
 * Format both inputs to canonical form, then diff them. The pipeline is kept
 * synchronous so it runs untouched inside a Web Worker (off the main thread)
 * and in vitest.
 *
 * Besides a unified patch (for export) and counts, it returns structured
 * line-level rows that the UI renders directly — no external diff renderer.
 */
export function computeDiff(
  a: string,
  b: string,
  lang: LanguageId,
  optsA: FormatOptions,
  optsB: FormatOptions,
): DiffResult {
  const adapter = getAdapter(lang);
  const oA = applyOptsDefaults(adapter, optsA);
  const oB = applyOptsDefaults(adapter, optsB);
  const canonicalA = adapter.format(a, oA).canonical;
  const canonicalB = adapter.format(b, oB).canonical;
  return computeDiffCanonical(canonicalA, canonicalB, lang);
}

/**
 * Diff two already-canonicalized texts (the async formatting pass having
 * already run in the engine worker). Builds the unified patch and structured
 * line rows. Kept separate from `computeDiff` so the worker can feed it
 * fully-formatted canonical text without re-running `format()`.
 */
export function computeDiffCanonical(
  canonicalA: string,
  canonicalB: string,
  lang: LanguageId,
): DiffResult {
  const adapter = getAdapter(lang);
  // Use the SAME file name for both sides so the patch has no rename.
  const patch = createTwoFilesPatch("diff", "diff", canonicalA, canonicalB, "", "", {
    context: 3,
  });
  return {
    language: adapter.id,
    patch,
    counts: countLines(patch),
    lines: buildLines(diffLines(canonicalA, canonicalB)),
  };
}

function buildLines(parts: Change[]): DiffLine[] {
  const lines: DiffLine[] = [];
  let aNum = 0;
  let bNum = 0;
  let delBuf: DiffLine[] = [];
  let addBuf: DiffLine[] = [];

  const flush = (): void => {
    const pairs = Math.max(delBuf.length, addBuf.length);
    for (let i = 0; i < pairs; i++) {
      const del = delBuf[i];
      const add = addBuf[i];
      if (del && add) {
        const [aSeg, bSeg] = inlineSegments(del.a!, add.b!);
        del.aSeg = aSeg;
        add.bSeg = bSeg;
      }
      if (del) lines.push(del);
      if (add) lines.push(add);
    }
    delBuf = [];
    addBuf = [];
  };

  for (const part of parts) {
    const arr = part.value.split("\n");
    if (arr[arr.length - 1] === "") arr.pop();
    if (part.removed) {
      for (const text of arr) {
        aNum++;
        delBuf.push({ kind: "del", a: text, aNum, b: null, bNum: null });
      }
    } else if (part.added) {
      for (const text of arr) {
        bNum++;
        addBuf.push({ kind: "add", a: null, aNum: null, b: text, bNum });
      }
    } else {
      flush();
      for (const text of arr) {
        aNum++;
        bNum++;
        lines.push({ kind: "ctx", a: text, aNum, b: text, bNum });
      }
    }
  }
  flush();
  return lines;
}

/**
 * Word-level inline diff between a deleted and an added line. Returns the
 * segment lists for each side; shared words render as `ctx`, the changed
 * words as `del` (old side) / `add` (new side).
 */
function inlineSegments(aText: string, bText: string): [InlineSegment[], InlineSegment[]] {
  const parts = diffWordsWithSpace(aText, bText);
  const aSeg: InlineSegment[] = [];
  const bSeg: InlineSegment[] = [];
  for (const part of parts) {
    if (part.removed) {
      aSeg.push({ text: part.value, kind: "del" });
    } else if (part.added) {
      bSeg.push({ text: part.value, kind: "add" });
    } else {
      aSeg.push({ text: part.value, kind: "ctx" });
      bSeg.push({ text: part.value, kind: "ctx" });
    }
  }
  return [aSeg, bSeg];
}

function countLines(patch: string): DiffCounts {
  let added = 0;
  let removed = 0;
  for (const line of patch.split("\n")) {
    if (line.startsWith("+++") || line.startsWith("---")) continue;
    if (line.startsWith("+")) added++;
    else if (line.startsWith("-")) removed++;
  }
  return { added, removed };
}
