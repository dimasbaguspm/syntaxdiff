import { getAdapter } from "@/modules/engine/lib";
import type { DiffRecord } from "@/core/db";

/** Case-insensitive filter over language label + source labels. */
export function filterDiffs(diffs: DiffRecord[], query: string): DiffRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return diffs;
  return diffs.filter((d) => {
    const hay = [getAdapter(d.lang).label, d.labelA, d.labelB]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}
