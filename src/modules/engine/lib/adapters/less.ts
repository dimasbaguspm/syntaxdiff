import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { makePrettierAdapter, markupPrettierToggles } from "./code-format";

function detectLess(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/@[\w-]+\s*:\s*[^;]+;/.test(t)) return 0.8; // less variables
  if (/^[.#]?[\w-]+\s*\{[^}]*\}/m.test(t)) return 0.5;
  return 0;
}

export const lessAdapter: LanguageAdapter = makePrettierAdapter({
  id: "less",
  label: "Less",
  parser: "less",
  prettierOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  toggles: markupPrettierToggles,
  detect: detectLess,
});
