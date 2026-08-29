import type { FormatOptions, FormatResult, LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles } from "./code-format";
import { looksLikeJsonContainer } from "./shared-detect";

function detectJsonc(input: string): number {
  const t = input.trimStart();
  if (!t || t.length < 2) return 0;
  if (!looksLikeJsonContainer(input)) return 0;
  const hasComment = /\/\/|^\s*\/\*/m.test(input) || /\/\*/.test(input);
  const hasTrailingComma = /,\s*[\]}]/.test(input);
  if (hasComment || hasTrailingComma) return 0.9;
  try {
    JSON.parse(input);
    return 0.3;
  } catch {
    return 0.6;
  }
}

/** Lenient canonicalization: trim only (comments/trailing commas allowed). */
function jsoncCanonical(input: string, _opts: FormatOptions): FormatResult {
  return { canonical: input.trim() };
}

export const jsoncAdapter: LanguageAdapter = {
  id: "jsonc",
  label: "JSONC",
  fmtParser: "jsonc",
  fmtOptions: { tabWidth: 2, printWidth: 80 },
  detect: detectJsonc,
  toggles: markupFmtToggles,
  format: jsoncCanonical,
};
