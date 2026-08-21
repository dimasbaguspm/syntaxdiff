import { ParseError } from "../types";
import type { FormatOptions, LanguageAdapter } from "../types";

/**
 * Minimal RFC 4180 CSV parser.
 *
 * Supports: quoted fields, commas / quotes / newlines inside quotes,
 * doubled-quote escaping (`""`), and both CRLF and bare-CR line endings.
 * Comma is the only supported delimiter (tabs / semicolons are out of
 * scope for the MVP).
 */
export function parseCsv(input: string): string[][] {
  const normalized = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < normalized.length) {
    const c = normalized[i];

    if (inQuotes) {
      if (c === '"') {
        // Doubled quote => literal quote; otherwise it closes the field.
        if (normalized[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i += 1;
        }
        continue;
      }
      field += c;
      i += 1;
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    field += c;
    i += 1;
  }

  if (inQuotes) {
    throw new ParseError("Unterminated quoted field in CSV");
  }
  // Emit the final row unless the input ended on a clean newline.
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const NEEDS_QUOTING = /[",\n]/;

/**
 * Re-serialize parsed rows as RFC 4180 CSV. A cell is quoted only when it
 * contains a delimiter, quote, or newline. Cell content is preserved exactly
 * — any whitespace trimming is the caller's job (see `opts.trimCells` in
 * `csvAdapter.format`), so this function never trims on its own.
 */
export function serializeCsv(rows: string[][]): string {
  const quote = (cell: string): string =>
    NEEDS_QUOTING.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;

  return rows.map((row) => row.map(quote).join(",")).join("\n") + "\n";
}

/**
 * Pretty-table serialization: pad every column to a width derived from its
 * HEADER (plus a small minimum) and join with ` | ` so the table lines up
 * vertically. Widths come from the header, not the data rows — that keeps
 * padding identical across the two panes even when one side has longer
 * cells (e.g. "Out of Stock" vs "In Stock"), so unchanged rows match
 * row-to-row and only genuinely changed cells are highlighted. Cells wider
 * than their column simply extend (they are not truncated).
 */
export function serializeAlignedCsv(rows: string[][]): string {
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

const MIN_CSV_LINES = 2;

export const csvAdapter: LanguageAdapter = {
  id: "csv",
  label: "CSV",
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
    { id: "sortRows", label: "Sort rows (keep header)", default: false },
    { id: "trimCells", label: "Trim cell whitespace", default: true },
    { id: "alignColumns", label: "Align columns", default: true },
  ],
  format(input: string, opts: FormatOptions) {
    const rows = parseCsv(input);
    if (rows.length === 0) return { canonical: "" };

    const trim = opts.trimCells !== false;
    let normalized = trim ? rows.map((row) => row.map((cell) => cell.trim())) : rows;

    // Whitespace-only input carries no data — treat it as empty rather than
    // emitting blank aligned rows (which would create spurious diff lines).
    const isBlank = normalized.every((row) => row.every((cell) => cell.trim() === ""));
    if (isBlank) return { canonical: "" };

    if (opts.sortRows === true && normalized.length > 1) {
      const [header, ...data] = normalized;
      data.sort((a, b) => a.join(",").localeCompare(b.join(",")));
      normalized = [header, ...data];
    }

    const canonical =
      opts.alignColumns === false ? serializeCsv(normalized) : serializeAlignedCsv(normalized);
    return { canonical };
  },
};
