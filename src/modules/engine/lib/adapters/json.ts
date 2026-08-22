import { ParseError } from "@/modules/engine/lib/types";
import type { FormatOptions, FormatResult, LanguageAdapter } from "@/modules/engine/lib/types";
import { makePrettierAdapter, markupPrettierToggles } from "./code-format";

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

export const jsonAdapter: LanguageAdapter = makePrettierAdapter({
  id: "json",
  label: "JSON",
  parser: "json",
  prettierOptions: { tabWidth: 2, printWidth: 80 },
  robust: jsonCanonical,
  toggles: [{ id: "minify", label: "Minify" }, ...markupPrettierToggles],
  detect: detectJson,
});

export { parse as parseJson };
