import type { Plugin } from "prettier";
import type {
  FormatOptions,
  FormatResult,
  LanguageAdapter,
  LanguageId,
  ToggleDef,
} from "@/modules/engine/lib/types";

export interface CodeFormatOpts {
  trimTrailing?: boolean;
  normalizeIndent?: boolean;
}

/** Inputs longer than this many lines are offloaded to the engine worker's
 *  async Prettier pass; smaller inputs still run inline there. */
export const FORMATTER_LINE_THRESHOLD = 200;

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
 *  This is the always-available, NEVER-throwing baseline used by `format()`. */
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

/** Whitespace-only canonicalization shared by data langs and formatter-disabled
 *  languages: normalize line endings + trim trailing whitespace. No parse, no
 *  reindent — never throws. */
export function whitespaceCanonicalize(input: string, opts: FormatOptions): FormatResult {
  const canonical = normalizeWhitespace(input, { trimTrailing: opts.trimTrailing !== false });
  return { canonical };
}

/**
 * Real formatter pass via Prettier (loaded lazily so it never bloats the
 * cold-start of the synchronous `format()` path). Returns the formatted text,
 * or `null` when Prettier is unavailable or rejects (e.g. invalid syntax) so
 * callers can fall back to the robust canonical text.
 *
 * Each plugin specifier is dynamically `import()`-ed here, so plugins are
 * code-split into lazy chunks and never pulled into the main entry. A specifier
 * may be an npm id string or an already-resolved `Plugin` object (used for the
 * in-repo CSV plugin).
 *
 * NOTE: Prettier 3's `format` is async-only — there is no synchronous API. The
 * engine's canonicalization pipeline runs inside a Web Worker, so the async
 * pass lives on `formatAsync` and is offloaded there. See `worker.ts`.
 */
export async function formatWithPrettier(
  code: string,
  parser: string,
  plugins: Array<string | Plugin>,
  options: Record<string, unknown>,
): Promise<string | null> {
  try {
    const prettier = await import("prettier");
    const resolved = await Promise.all(
      plugins.map(async (p) => {
        if (typeof p !== "string") return p;
        const mod = (await import(p)) as { default?: unknown };
        return (mod.default ?? mod) as Plugin;
      }),
    );
    return await prettier.format(code, { parser, plugins: resolved, ...options });
  } catch {
    return null;
  }
}

/** Configuration for the generic async Prettier canonicalization pass. */
export interface PrettierFormatConfig {
  parser: string;
  plugins?: Array<string | Plugin>;
  /** Prettier option defaults; entries are overridden by matching `opts` keys. */
  options?: Record<string, unknown>;
  /** Robust synchronous baseline (used directly and as the Prettier fallback). */
  robust: (input: string, opts: FormatOptions) => FormatResult;
}

/**
 * Generic async canonicalization: applies Prettier, falling back to the robust
 * canonicalizer, and finally to whitespace-only normalization. Always resolves
 * — Prettier/parse failures never throw (invalid syntax resolves to a safe
 * canonical text so the diff pipeline can still run).
 */
export async function genericFormatAsync(
  input: string,
  opts: FormatOptions,
  cfg: PrettierFormatConfig,
): Promise<FormatResult> {
  const options: Record<string, unknown> = { ...(cfg.options ?? {}) };
  for (const key of Object.keys(options)) {
    if (opts[key] !== undefined) options[key] = opts[key];
  }
  const pretty = await formatWithPrettier(input, cfg.parser, cfg.plugins ?? [], options);
  if (pretty !== null) return { canonical: pretty };
  try {
    return { canonical: cfg.robust(input, opts).canonical };
  } catch {
    // Robust canonicalizer (e.g. parse) can also reject invalid input — fall
    // back to the always-safe whitespace normalization rather than throwing.
    return { canonical: whitespaceCanonicalize(input, opts).canonical };
  }
}

/**
 * Build a `LanguageAdapter` whose `format()` is the robust whitespace baseline
 * and whose `formatAsync()` (when the language is not `formatterDisabled`)
 * applies Prettier via `genericFormatAsync`.
 */
export function makePrettierAdapter(config: {
  id: LanguageId;
  label: string;
  parser: string;
  plugins?: Array<string | Plugin>;
  prettierOptions?: Record<string, unknown>;
  toggles?: ToggleDef[];
  detect: (input: string) => number;
  formatterDisabled?: boolean;
  robust?: (input: string, opts: FormatOptions) => FormatResult;
}): LanguageAdapter {
  const robust = config.robust ?? ((input, opts) => whitespaceCanonicalize(input, opts));
  const adapter: LanguageAdapter = {
    id: config.id,
    label: config.label,
    detect: config.detect,
    toggles: config.toggles ?? [],
    prettierParser: config.parser,
    prettierPlugins: config.plugins,
    prettierOptions: config.prettierOptions,
    formatterDisabled: config.formatterDisabled,
    format: (input, opts) => robust(input, opts),
    formatAsync: config.formatterDisabled
      ? undefined
      : (input, opts) =>
          genericFormatAsync(input, opts, {
            parser: config.parser,
            plugins: config.plugins,
            options: config.prettierOptions,
            robust,
          }),
  };
  return adapter;
}

/** Shared Prettier option toggles for code languages. */
export const codePrettierToggles: ToggleDef[] = [
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

/** Prettier option toggles for whitespace-sensitive markup (no quote/semicolon opts). */
export const markupPrettierToggles: ToggleDef[] = [
  { id: "printWidth", label: "Print width", type: "number", default: 80 },
  { id: "tabWidth", label: "Tab width", type: "number", default: 2 },
  { id: "useTabs", label: "Indent with tabs", default: false },
];

/** Shared toggle set for code-language adapters (kept for compatibility). */
export const codeToggles = [
  { id: "trimTrailing", label: "Trim trailing whitespace", default: true },
  { id: "normalizeIndent", label: "Normalize indentation", default: true },
] as const;
