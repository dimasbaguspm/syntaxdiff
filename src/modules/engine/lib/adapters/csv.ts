import type { LanguageAdapter } from "@/modules/engine/lib/types";
import {
  csvCanonical,
  parseCsv,
  serializeAlignedCsv,
  serializeCsv,
} from "@/modules/engine/lib/adapters/csv-core";
import { csvPlugin } from "@/modules/engine/lib/prettier-plugins/csv";
import { makePrettierAdapter } from "@/modules/engine/lib/adapters/code-format";

export { parseCsv, serializeCsv, serializeAlignedCsv };

const MIN_CSV_LINES = 2;

export const csvAdapter: LanguageAdapter = makePrettierAdapter({
  id: "csv",
  label: "CSV",
  parser: "csv",
  plugins: [csvPlugin],
  prettierOptions: { delimiter: ",", alignColumns: true },
  robust: (input, opts) => csvCanonical(input, opts),
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
});
