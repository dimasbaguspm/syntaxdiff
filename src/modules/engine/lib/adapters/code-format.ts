import type { FormatOptions, LanguageId } from "@/modules/engine/lib/types";

export interface CodeFormatOpts {
  trimTrailing?: boolean;
  normalizeIndent?: boolean;
}

/** Inputs longer than this many lines are offloaded to a dedicated formatter
 *  Web Worker (see `src/core/worker/formatter-client.ts`); smaller inputs are
 *  formatted inline to avoid the worker round-trip. */
export const FORMATTER_LINE_THRESHOLD = 200;

/** Prettier parsers we support. `babel` for JS, `babel-ts` for TS. */
export type PrettierParser = "babel" | "babel-ts";

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

/** Default canonicalization for code languages: trim + optional reindent.
 *  This is the always-available, NEVER-throwing path used by `format()`. */
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

/**
 * Real formatter pass via Prettier (loaded lazily so it never bloats the
 * cold-start of the synchronous `format()` path). Returns the formatted text,
 * or `null` when Prettier is unavailable or rejects (e.g. invalid syntax) so
 * callers can fall back to `formatCode`.
 *
 * NOTE: Prettier 3's `format` is async-only — there is no synchronous API. The
 * engine's canonicalization pipeline is intentionally synchronous (it runs
 * inside a Web Worker and in vitest, and `format()` must never throw), so the
 * real Prettier pass lives on the async `formatCodeAsync` path and is
 * offloaded to a dedicated formatter worker for large inputs. See the module
 * header in `src/core/worker/formatter-client.ts`.
 */
export async function formatWithPrettier(
  code: string,
  parser: PrettierParser,
): Promise<string | null> {
  try {
    const prettier = await import("prettier");
    return await prettier.format(code, {
      parser,
      semi: true,
      singleQuote: false,
      printWidth: 80,
      tabWidth: 2,
    });
  } catch {
    return null;
  }
}

/**
 * Canonicalization that layers the real Prettier formatter on top of the
 * robust whitespace canonicalizer. `format()` stays synchronous & never
 * throws; this async variant is what actually applies Prettier so trivial
 * style diffs vanish.
 *
 * - JS/TS: Prettier (`babel` / `babel-ts`) — real formatting.
 * - Go/PHP: no robust, worker-friendly pure-JS formatter exists (gofmt has no
 *   reliable JS port; `@prettier/plugin-php` needs the PHP binary at runtime).
 *   We keep the best-effort whitespace canonicalizer and document the
 *   limitation rather than fabricate a result.
 *
 * Always resolves; on any failure it returns the robust canonical text.
 */
export async function formatCodeAsync(
  input: string,
  opts: FormatOptions,
  lang: LanguageId,
): Promise<{ canonical: string }> {
  // Robust, synchronous, never-throwing baseline.
  const robust = formatCode(input, opts).canonical;

  // `useFormatter` defaults to true; opt out via opts.useFormatter === false.
  if (opts.useFormatter === false) return { canonical: robust };

  if (lang === "js" || lang === "ts") {
    const parser: PrettierParser = lang === "ts" ? "babel-ts" : "babel";
    const pretty = await formatWithPrettier(robust, parser);
    return { canonical: pretty ?? robust };
  }

  // Go / PHP: best-effort only (documented limitation).
  return { canonical: robust };
}

/** Shared toggle set for code-language adapters. */
export const codeToggles = [
  { id: "trimTrailing", label: "Trim trailing whitespace", default: true },
  { id: "normalizeIndent", label: "Normalize indentation", default: true },
] as const;
