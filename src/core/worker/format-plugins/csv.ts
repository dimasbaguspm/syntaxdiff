import type { AstPath, Doc, ParserOptions, Plugin } from "prettier";
import { parseCsv } from "@/modules/engine/lib/adapters/csv-core";

/**
 * In-repo formatter plugin for CSV (no npm CSV plugin exists). It re-serializes
 * rows with a normalized delimiter, consistent quoting, trimmed cells, `\n`
 * line endings, and optional column alignment.
 *
 * WORKER-ONLY: this module is part of the engine Web Worker graph
 * (`core/worker/*`). Nothing on the main thread may import it — it pulls in
 * the heavy formatter runtime via its `prettier` type dependency and must stay
 * out of the main entry chunk.
 */

interface CsvAst {
  rows: string[][];
}

function resolveDelimiter(value: unknown): string {
  if (value === "tab") return "\t";
  if (typeof value === "string" && value.length > 0) return value;
  return ",";
}

function quoteCell(cell: string): string {
  return /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
}

/** Serialize rows per the resolved options (delimiter + optional alignment). */
export function printCsv(ast: CsvAst, delimiter: string, alignColumns: boolean): string {
  const rows = ast.rows.map((row) => row.map((cell) => cell.trim()));
  if (rows.length === 0) return "";
  const isBlank = rows.every((row) => row.every((cell) => cell.trim() === ""));
  if (isBlank) return "";

  if (alignColumns) {
    const header = rows[0] ?? [];
    const colCount = rows.reduce((max, r) => Math.max(max, r.length), header.length);
    const MIN_WIDTH = 4;
    const widths = Array.from({ length: colCount }, (_, c) =>
      Math.max(header[c]?.length ?? 0, MIN_WIDTH),
    );
    return (
      rows
        .map((row) => row.map((cell, c) => (cell ?? "").padEnd(widths[c] ?? 0)).join(" | "))
        .join("\n") + "\n"
    );
  }

  return rows.map((row) => row.map(quoteCell).join(delimiter)).join("\n") + "\n";
}

export const csvPlugin: Plugin = {
  languages: [
    {
      name: "csv",
      parsers: ["csv"],
      extensions: [".csv"],
      vscodeLanguageIds: ["csv"],
    },
  ],
  parsers: {
    csv: {
      astFormat: "csv",
      locStart: () => 0,
      locEnd: () => 0,
      parse: (text: string): CsvAst => {
        return { rows: parseCsv(text) };
      },
    },
  },
  printers: {
    csv: {
      print(path: AstPath, options: ParserOptions): Doc {
        const o = options as ParserOptions & { delimiter?: unknown; alignColumns?: unknown };
        const ast = path.getValue() as CsvAst;
        const delimiter = resolveDelimiter(o.delimiter);
        const alignColumns = o.alignColumns !== false;
        return printCsv(ast, delimiter, alignColumns);
      },
    },
  },
  options: {
    delimiter: {
      type: "string",
      category: "csv",
      default: ",",
      description: "Field delimiter for CSV formatting.",
    },
    alignColumns: {
      type: "boolean",
      category: "csv",
      default: true,
      description: "Align CSV columns into a readable table.",
    },
  },
};

export default csvPlugin;
