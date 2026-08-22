import { ParseError } from "@/modules/engine/lib/types";
import type { FormatOptions, FormatResult, LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles } from "./code-format";
import { looksLikeJsonContainer } from "./shared-detect";

function detectJson5(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (looksLikeJsonContainer(input)) {
    try {
      JSON.parse(input);
      return 1;
    } catch {
      return 0.6;
    }
  }
  return 0;
}

/** Parse + re-serialize (2-space). Throws `ParseError` on invalid input. */
function json5Canonical(input: string, _opts: FormatOptions): FormatResult {
  let value: unknown;
  try {
    value = JSON.parse(input) as unknown;
  } catch (e) {
    throw new ParseError(`Invalid JSON5: ${(e as Error).message}`);
  }
  return { canonical: JSON.stringify(value, null, 2) };
}

export const json5Adapter: LanguageAdapter = {
  id: "json5",
  label: "JSON5",
  fmtParser: "json5",
  fmtOptions: { tabWidth: 2, printWidth: 80 },
  detect: detectJson5,
  toggles: markupFmtToggles,
  format: json5Canonical,
};
