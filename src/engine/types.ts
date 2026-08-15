/**
 * Core engine types. This module is intentionally framework-free and pure —
 * it must run identically in a Web Worker and in Node (vitest).
 */

export type LanguageId = "json" | "yaml" | "sql" | "toml" | "xml" | "bson" | "plain";

/** A language-specific UI toggle, rendered from the adapter itself. */
export interface ToggleDef {
  id: string;
  label: string;
  default?: boolean;
}

export type FormatOptions = Record<string, boolean | undefined>;

export interface FormatResult {
  /** Canonical, normalized text used for diffing (and display). */
  canonical: string;
}

export interface LanguageAdapter {
  id: LanguageId;
  label: string;
  /** Heuristic confidence in [0, 1] that `input` belongs to this language. */
  detect(input: string): number;
  toggles: ToggleDef[];
  /** Parse + canonicalize `input`. Throws `ParseError` on invalid input. */
  format(input: string, opts: FormatOptions): FormatResult;
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

export interface DiffCounts {
  added: number;
  removed: number;
}

export interface DiffResult {
  language: LanguageId;
  /** Unified diff text (jsdiff), fed to diff2html for rendering. */
  patch: string;
  counts: DiffCounts;
}
