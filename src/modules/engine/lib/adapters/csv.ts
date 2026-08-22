import type { LanguageAdapter } from "@/modules/engine/lib/types";
import {
  csvCanonical,
  parseCsv,
  serializeAlignedCsv,
  serializeCsv,
} from "@/modules/engine/lib/adapters/csv-core";

export { parseCsv, serializeCsv, serializeAlignedCsv };

const MIN_CSV_LINES = 2;

/** Plain metadata + robust sync canonicalization; the CSV formatter plugin is
 *  wired worker-side only (see `src/core/worker`). */
export const csvAdapter: LanguageAdapter = {
  id: "csv",
  label: "CSV",
  fmtParser: "csv",
  fmtOptions: { delimiter: ",", alignColumns: true },
  detect(input: string): number {
    const text = input.trim();
    if (!text) return 0;

    const lines = text.split("\n").filter((l) => l.trim() !== "");
    if (lines.length < MIN_CSV_LINES) return 0;

    // Consistent, multi-column structure is a strong CSV signal; prose or
    // single-column text won't satisfy both conditions.
    const columnCounts = new Set(lines.map((l) => l.split(",").length));
    const firstCount = columnCounts.values().next().value as number | undefined;
    if (columnCounts.size === 1 && (firstCount ?? 0) > 1) {
      return 0.7;
    }
    return 0;
  },
  toggles: [
    {
      id: "delimiter",
      label: "Delimiter",
      type: "select",
      options: [",", ";", "tab"],
      default: ",",
    },
    { id: "alignColumns", label: "Align columns", default: true },
    { id: "trimCells", label: "Trim cell whitespace", default: true },
    { id: "sortRows", label: "Sort rows (keep header)", default: false },
  ],
  format: (input, opts) => csvCanonical(input, opts),
};
