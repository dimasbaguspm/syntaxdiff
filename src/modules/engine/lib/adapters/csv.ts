import type { LanguageAdapter } from "@/modules/engine/lib/types";
import {
  csvCanonical,
  parseCsv,
  serializeAlignedCsv,
  serializeCsv,
} from "@/modules/engine/lib/adapters/csv-core";
import { detectDelimited } from "./shared-detect";

export { parseCsv, serializeCsv, serializeAlignedCsv };

const CSV_DELIMITERS = [",", ";", "\t"];

/** Plain metadata + robust sync canonicalization; the CSV formatter plugin is
 *  wired worker-side only (see `src/core/worker`). */
export const csvAdapter: LanguageAdapter = {
  id: "csv",
  label: "CSV",
  fmtParser: "csv",
  fmtOptions: { delimiter: ",", alignColumns: true },
  detect(input: string): number {
    // A consistent, multi-column structure on ANY supported delimiter is a
    // strong CSV/TSV signal; prose or single-column text won't satisfy it.
    for (const delim of CSV_DELIMITERS) {
      const score = detectDelimited(input, delim);
      if (score > 0) return score;
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
