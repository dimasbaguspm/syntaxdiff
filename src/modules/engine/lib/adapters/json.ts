import { ParseError } from "@/modules/engine/lib/types";
import type { FormatOptions, FormatResult, LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles } from "./code-format";

function parse(input: string): unknown {
  try {
    return JSON.parse(input) as unknown;
  } catch (e) {
    throw new ParseError(`Invalid JSON: ${(e as Error).message}`);
  }
}

/** Parse + re-serialize WITHOUT key-sort. Key order is preserved (key reorder
 *  is now a real diff — accepted). Throws `ParseError` on invalid input. */
function jsonCanonical(input: string, _opts: FormatOptions): FormatResult {
  const value = parse(input);
  const minify = _opts.minify === true;
  return { canonical: JSON.stringify(value, null, minify ? 0 : 2) };
}

function detectJson(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (t.startsWith("{") || t.startsWith("[")) {
    try {
      JSON.parse(input);
      return 1;
    } catch {
      return 0.6; // looks like JSON but malformed — still surface it
    }
  }
  return 0;
}

/** Plain metadata + robust sync canonicalization. The async formatting pass is
 *  attached worker-side only (see `src/core/worker`). */
export const jsonAdapter: LanguageAdapter = {
  id: "json",
  label: "JSON",
  fmtParser: "json",
  fmtOptions: { tabWidth: 2, printWidth: 80 },
  detect: detectJson,
  toggles: [{ id: "minify", label: "Minify" }, ...markupFmtToggles],
  format: jsonCanonical,
};

export { parse as parseJson };
