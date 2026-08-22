import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { makePrettierAdapter, markupPrettierToggles } from "./code-format";

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

export const jsoncAdapter: LanguageAdapter = makePrettierAdapter({
  id: "jsonc",
  label: "JSONC",
  parser: "jsonc",
  prettierOptions: { tabWidth: 2, printWidth: 80 },
  robust: (input, _opts) => ({ canonical: input.trim() }),
  toggles: markupPrettierToggles,
  detect: detectJsonc,
});
