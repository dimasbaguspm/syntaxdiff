/**
 * Shared detection helpers + canonical keyword/marker lists reused across the
 * language adapters. Keeping these in one place removes the copy-pasted regex
 * and keyword lists that were duplicated between adapters (e.g. JSON shape,
 * YAML markers, TOML patterns, XML/CSV/SQL markers).
 *
 * Framework-free + pure: this module runs identically in a Web Worker and in
 * Node (vitest). No DOM, no React, no I/O.
 */

import { ParseError } from "@/modules/engine/lib/types";
import type { SqlLanguage } from "sql-formatter";

/* ------------------------------------------------------------------ */
/* Generic shapes                                                     */
/* ------------------------------------------------------------------ */

/** True when `input` is a non-empty string beginning with `{` or `[` (the
 *  universal JSON / JSON5 / JSONC / YAML-flow object-or-array opener). */
export function looksLikeJsonContainer(input: string): boolean {
  const t = input.trimStart();
  return t.startsWith("{") || t.startsWith("[");
}

/* ------------------------------------------------------------------ */
/* SQL                                                                */
/* ------------------------------------------------------------------ */

/** First-token keywords that strongly indicate the input is SQL. */
export const SQL_KEYWORDS = /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH|SET|MERGE)\b/;

/** All SQL dialect slugs known to sql-formatter. */
export const SQL_DIALECTS = [
  "sql",
  "mysql",
  "postgresql",
  "sqlite",
  "mssql",
  "mariadb",
  "plsql",
  "bigquery",
  "snowflake",
  "cockroachdb",
] as const;

export const DIALECT_SET = new Set<string>(SQL_DIALECTS);

/** Resolve a user-supplied dialect to a known one, defaulting to `"sql"`. */
export function resolveDialect(dialect: unknown): SqlLanguage {
  return typeof dialect === "string" && DIALECT_SET.has(dialect) ? (dialect as SqlLanguage) : "sql";
}

/** Strongly SQL when a statement-leading keyword appears at the start. */
export function detectSql(input: string): number {
  return SQL_KEYWORDS.test(input.trimStart().toUpperCase()) ? 1 : 0;
}

/* ------------------------------------------------------------------ */
/* YAML                                                               */
/* ------------------------------------------------------------------ */

/** Lines that look like a YAML mapping (`key:`), a list item (`- `), or the
 *  document-start marker (`---`). */
export const YAML_MAPPING = /^[\w"'$@-]+:\s/m;
export const YAML_LIST = /^-\s+/m;
export const YAML_DOC_MARKER = /^---\s*$/;

/* ------------------------------------------------------------------ */
/* TOML                                                               */
/* ------------------------------------------------------------------ */

/** `key = value` or dotted `table.key = value`. */
export const TOML_KEY_VALUE = /^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*\s*=/m;
/** `[table]` or `[[array.of.tables]]`. */
export const TOML_TABLE = /^(\[){1,2}[\w. -]+\]{1,2}/m;

/* ------------------------------------------------------------------ */
/* XML                                                                */
/* ------------------------------------------------------------------ */

/** Any leading XML/HTML-ish tag (used as a coarse signal in several adapters). */
export const XML_TAG = /<[a-zA-Z][\w-]*(?:\s[^>]*)?>/;

/* ------------------------------------------------------------------ */
/* CSV (delimiter-agnostic)                                           */
/* ------------------------------------------------------------------ */

/**
 * Detect CSV/TSV/semicolon-delimited data: needs at least two non-empty lines
 * that split into the SAME number of >1 columns on the given delimiter. This
 * is delimiter-agnostic (the caller passes the separator) so the shared helper
 * can serve the csv adapter's configurable delimiter without re-copying logic.
 */
export function detectDelimited(input: string, delimiter: string): number {
  const text = input.trim();
  if (!text) return 0;

  const lines = text.split("\n").filter((l) => l.trim() !== "");
  if (lines.length < 2) return 0;

  const columnCounts = new Set(lines.map((l) => l.split(delimiter).length));
  const firstCount = columnCounts.values().next().value as number | undefined;
  if (columnCounts.size === 1 && (firstCount ?? 0) > 1) {
    return 0.7;
  }
  return 0;
}

/* ------------------------------------------------------------------ */
/* Safe parse wrappers (used by hardened detect() for data langs)      */
/* ------------------------------------------------------------------ */

/** Try a parser; return the value or `undefined` on failure. Never throws. */
export function tryParse<T>(input: string, parse: (s: string) => T): T | undefined {
  try {
    return parse(input);
  } catch {
    return undefined;
  }
}

/** Re-throw a parser failure as a `ParseError` carrying the original cause. */
export function parseOrThrow<T>(input: string, parse: (s: string) => T, label: string): T {
  try {
    return parse(input);
  } catch (e) {
    throw new ParseError(`Invalid ${label}: ${(e as Error).message}`);
  }
}
