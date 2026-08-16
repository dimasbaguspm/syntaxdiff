import { createTwoFilesPatch, diffLines, type Change } from "diff";
import { getAdapter } from "./registry";
import type {
  DiffCounts,
  DiffLine,
  DiffResult,
  FormatOptions,
  LanguageAdapter,
  LanguageId,
} from "./types";

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
  for (const part of parts) {
    const arr = part.value.split("\n");
    if (arr[arr.length - 1] === "") arr.pop();
    if (part.removed) {
      for (const text of arr) {
        aNum++;
        lines.push({ kind: "del", a: text, aNum, b: null, bNum: null });
      }
    } else if (part.added) {
      for (const text of arr) {
        bNum++;
        lines.push({ kind: "add", a: null, aNum: null, b: text, bNum });
      }
    } else {
      for (const text of arr) {
        aNum++;
        bNum++;
        lines.push({ kind: "ctx", a: text, aNum, b: text, bNum });
      }
    }
  }
  return lines;
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
