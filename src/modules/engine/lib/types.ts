/**
 * Core engine types. This module is intentionally framework-free and pure —
 * it must run identically in a Web Worker and in Node (vitest).
 *
 * NOTE: adapters are METADATA + robust sync canonicalization only. The heavy
 * async formatting pass is attached worker-side (see `core/worker`), so this
 * module (and everything reachable from it) stays main-thread-safe.
 */

export type LanguageId =
  | "json"
  | "json5"
  | "jsonc"
  | "yaml"
  | "yml"
  | "sql"
  | "csv"
  | "toml"
  | "xml"
  | "js"
  | "ts"
  | "go"
  | "php"
  | "ruby"
  | "rust"
  | "kotlin"
  | "java"
  | "html"
  | "css"
  | "less"
  | "scss"
  | "markdown"
  | "mdx"
  | "vue"
  | "angular"
  | "svelte"
  | "astro"
  | "graphql"
  | "gherkin"
  | "handlebars"
  | "pug"
  | "go-template"
  | "nginx"
  | "sh"
  | "glimmer"
  | "plain";

/** A language-specific UI option, rendered from the adapter itself. */
export interface ToggleDef {
  id: string;
  label: string;
  /** "boolean" renders a switch (default); "select" a dropdown; "number" a number input. */
  type?: "boolean" | "select" | "number";
  /** Choices for type === "select". */
  options?: string[];
  default?: boolean | string | number;
}

export type FormatOptions = Record<string, boolean | string | number | undefined>;

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
  /**
   * Async canonicalization that applies a real, heavy formatter (run inside
   * the engine Web Worker) on top of the robust synchronous `format()`.
   * Optional; when present it complements `format()` and is what actually makes
   * trivial style diffs vanish. Plain adapters never set it — the worker-side
   * wrapper attaches it. When absent (e.g. for `formatterDisabled` languages)
   * the diff uses the robust canonical text.
   */
  formatAsync?(input: string, opts: FormatOptions): Promise<FormatResult>;
  /**
   * Neutral formatter parser marker (e.g. "babel", "json", "xml"). Pure
   * metadata: the worker-side wrapper maps it to the heavy formatter pass.
   */
  fmtParser?: string;
  /** Default formatter options, overridden per-key by matching `opts` entries. */
  fmtOptions?: Record<string, unknown>;
  /**
   * True when no robust, browser/worker-friendly formatter exists (e.g. Ruby
   * needs its runtime binary, Kotlin/Rust toolchains crash in the browser,
   * Glimmer has no npm package). The Format button is disabled; the diff uses
   * the whitespace-only canonical text.
   */
  formatterDisabled?: boolean;
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

/** One rendered row of a diff. `a`/`b` carry the two sides (null when absent). */
export interface DiffLine {
  kind: "ctx" | "add" | "del";
  a: string | null;
  aNum: number | null;
  b: string | null;
  bNum: number | null;
  /** Inline (word-level) highlight for a `del` line paired with its add. */
  aSeg?: InlineSegment[];
  /** Inline (word-level) highlight for an `add` line paired with its del. */
  bSeg?: InlineSegment[];
}

/** One highlighted run inside a diff line (word-level inline diff). */
export interface InlineSegment {
  text: string;
  kind: "ctx" | "add" | "del";
}

export interface DiffResult {
  language: LanguageId;
  /** Unified diff text (jsdiff), kept for reference/export. */
  patch: string;
  counts: DiffCounts;
  /** Structured line-level rows for rendering (split or unified). */
  lines: DiffLine[];
}
