import type { FormatOptions, FormatResult, LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles } from "./code-format";

function detectJsonc(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (t.startsWith("{") || t.startsWith("[")) {
    // JSONC allows comments / trailing commas; a plain JSON.parse failure is
    // not disqualifying here.
    return 0.7;
  }
  return 0;
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
