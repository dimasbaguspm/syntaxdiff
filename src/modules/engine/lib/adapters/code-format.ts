import type { FormatOptions, FormatResult, ToggleDef } from "@/modules/engine/lib/types";

export interface CodeFormatOpts {
  trimTrailing?: boolean;
  normalizeIndent?: boolean;
}

/** Normalize line endings to `\n` and (optionally) trim trailing whitespace. */
export function normalizeWhitespace(input: string, opts: CodeFormatOpts): string {
  let text = input.replace(/\r\n?/g, "\n");
  if (opts.trimTrailing) {
    text = text
      .split("\n")
      .map((line) => line.replace(/[ \t]+$/u, ""))
      .join("\n");
  }
  return text;
}

/**
 * Naive but robust beam reindent: 2 spaces per bracket depth. It only rewrites
 * leading indentation from the net bracket delta per line, so it never mangles
 * tokens. Returns `null` when the input looks unbalanced (depth would go
 * negative) so callers can skip reindenting and fall back to whitespace-trim.
 */
export function reindent(input: string): string | null {
  const lines = input.split("\n");
  const out: string[] = [];
  let depth = 0;
  for (const raw of lines) {
    const trimmed = raw.replace(/^[ \t]+/u, "").replace(/[ \t]+$/u, "");
    // Closing brackets at the very start reduce depth *before* this line.
    const leadingClose = (trimmed.match(/^[}\])]+/u) ?? [""])[0].length;
    if (leadingClose > 0) {
      const next = depth - leadingClose;
      if (next < 0) return null; // unbalanced — bail, caller skips reindent
      depth = next;
    }
    if (trimmed !== "") out.push("  ".repeat(depth) + trimmed);
    else out.push("");
    const opens = (trimmed.match(/[{[(]/g) ?? []).length;
    const closes = (trimmed.match(/[}\])]/g) ?? []).length;
    depth += opens - closes;
  }
  return out.join("\n");
}

/**
 * Default canonicalization for code languages: trim + optional reindent.
 *
 * This is the always-available, NEVER-throwing synchronous baseline that runs
 * on the main thread (validation) and inside the worker (diff pipeline). The
 * heavy async formatting pass is attached worker-side only — see the adapter
 * wiring under `src/core/worker` — so nothing in the main-thread module
 * graph pulls in a formatter runtime.
 */
export function formatCode(input: string, opts: FormatOptions): FormatResult {
  const trim = opts.trimTrailing !== false;
  const normalize = opts.normalizeIndent !== false;
  let canonical = normalizeWhitespace(input, { trimTrailing: trim });
  if (normalize) {
    try {
      const indented = reindent(canonical);
      if (indented !== null) canonical = indented;
    } catch {
      // Reindent is best-effort; never let it break canonicalization.
    }
  }
  return { canonical };
}

/**
 * Whitespace-only canonicalization shared by data langs and formatter-disabled
 * languages: normalize line endings + trim trailing whitespace. No parse, no
 * reindent — never throws.
 */
export function whitespaceCanonicalize(input: string, opts: FormatOptions): FormatResult {
  const canonical = normalizeWhitespace(input, { trimTrailing: opts.trimTrailing !== false });
  return { canonical };
}

/** Shared option toggles for code languages (applied by the worker-side pass). */
export const codeFmtToggles: ToggleDef[] = [
  { id: "printWidth", label: "Print width", type: "number", default: 80 },
  { id: "tabWidth", label: "Tab width", type: "number", default: 2 },
  { id: "useTabs", label: "Indent with tabs", default: false },
  { id: "semi", label: "Semicolons", default: true },
  { id: "singleQuote", label: "Single quotes", default: false },
  {
    id: "trailingComma",
    label: "Trailing comma",
    type: "select",
    options: ["all", "es5", "none"],
    default: "all",
  },
  { id: "bracketSpacing", label: "Bracket spacing", default: true },
  {
    id: "arrowParens",
    label: "Arrow parens",
    type: "select",
    options: ["always", "avoid"],
    default: "always",
  },
];

/** Option toggles for whitespace-sensitive markup (no quote/semicolon opts). */
export const markupFmtToggles: ToggleDef[] = [
  { id: "printWidth", label: "Print width", type: "number", default: 80 },
  { id: "tabWidth", label: "Tab width", type: "number", default: 2 },
  { id: "useTabs", label: "Indent with tabs", default: false },
];

/** Shared toggle set for code-language adapters (kept for compatibility). */
export const codeToggles = [
  { id: "trimTrailing", label: "Trim trailing whitespace", default: true },
  { id: "normalizeIndent", label: "Normalize indentation", default: true },
] as const;
