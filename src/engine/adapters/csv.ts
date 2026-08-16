import { ParseError } from "../types";
import type { FormatOptions, LanguageAdapter } from "../types";

/**
 * Minimal RFC-4180-ish CSV parser. Handles quoted fields, commas/quotes/newlines
 * inside quotes, escaped quotes (`""`), and CRLF. Comma-separated only — the
 * MVP keeps tabs/delimiters out of scope.
 */
export function parseCsv(input: string): string[][] {
  const s = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < s.length) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += c;
    i++;
  }

  if (inQuotes) {
    throw new ParseError("Unterminated quoted field in CSV");
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Re-serialize parsed rows with consistent quoting and a trailing newline. */
export function serializeCsv(rows: string[][]): string {
  const quote = (cell: string): string => {
    const trimmed = cell.trim();
    if (/[",\n]/.test(trimmed)) return `"${trimmed.replace(/"/g, '""')}"`;
    return trimmed;
  };
  return rows.map((row) => row.map(quote).join(",")).join("\n") + "\n";
}

export const csvAdapter: LanguageAdapter = {
  id: "csv",
  label: "CSV",
  detect(input: string): number {
    const t = input.trim();
    if (!t) return 0;
    const lines = t.split("\n").filter((l) => l.trim() !== "");
    if (lines.length < 2) return 0;
    // Consistent column count across rows is a strong CSV signal.
    const counts = new Set(lines.map((l) => l.split(",").length));
    if (counts.size === 1 && (counts.values().next().value as number) > 1) {
      return 0.7;
    }
    return 0;
  },
  toggles: [
    { id: "sortRows", label: "Sort rows (keep header)", default: false },
    { id: "trimCells", label: "Trim cell whitespace", default: true },
  ],
  format(input: string, opts: FormatOptions) {
    const rows = parseCsv(input);
    let normalized = rows.map((row) =>
      opts.trimCells === false ? row : row.map((cell) => cell.trim()),
    );
    if (opts.sortRows === true && normalized.length > 1) {
      const [header, ...data] = normalized;
      data.sort((a, b) => a.join(",").localeCompare(b.join(",")));
      normalized = [header, ...data];
    }
    return { canonical: serializeCsv(normalized) };
  },
};