import type { DiffLine } from "@/modules/engine/lib/types";

/**
 * Group contiguous runs of changed lines ("add" | "del") for prev/next
 * change navigation. Context lines ("ctx") break groups.
 * Returns the starting line index of each group, in document order.
 */
export function computeChangeGroups(lines: readonly DiffLine[]): number[] {
  const starts: number[] = [];
  let inGroup = false;
  lines.forEach((ln, i) => {
    const changed = ln.kind === "add" || ln.kind === "del";
    if (changed && !inGroup) starts.push(i);
    inGroup = changed;
  });
  return starts;
}
