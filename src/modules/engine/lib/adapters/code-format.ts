import type { FormatOptions } from "@/modules/engine/lib/types";

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

/** Default canonicalization for code languages: trim + optional reindent. */
export function formatCode(input: string, opts: FormatOptions): { canonical: string } {
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

/** Shared toggle set for code-language adapters. */
export const codeToggles = [
  { id: "trimTrailing", label: "Trim trailing whitespace", default: true },
  { id: "normalizeIndent", label: "Normalize indentation", default: true },
] as const;
