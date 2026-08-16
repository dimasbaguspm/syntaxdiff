import { createTwoFilesPatch } from "diff";
import { getAdapter } from "./registry";
import type { DiffCounts, DiffResult, FormatOptions, LanguageId } from "./types";

/**
 * Format both inputs to canonical form, then produce a line-based unified
 * diff. This is the whole pipeline, kept synchronous so it runs untouched
 * inside a Web Worker (off the main thread) and in vitest.
 */
export function computeDiff(
  a: string,
  b: string,
  lang: LanguageId,
  optsA: FormatOptions,
  optsB: FormatOptions,
): DiffResult {
  const adapter = getAdapter(lang);
  const canonicalA = adapter.format(a, optsA).canonical;
  const canonicalB = adapter.format(b, optsB).canonical;
  // Use the SAME file name for both sides so diff2html doesn't report the two
  // inputs as a "rename".
  const patch = createTwoFilesPatch("diff", "diff", canonicalA, canonicalB, "", "", {
    context: 3,
  });
  return {
    language: adapter.id,
    patch,
    counts: countLines(patch),
  };
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
