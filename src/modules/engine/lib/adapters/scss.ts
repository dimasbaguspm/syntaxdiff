import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { makePrettierAdapter, markupPrettierToggles } from "./code-format";

function detectScss(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/\$[\w-]+\s*:\s*[^;]+;/.test(t)) return 0.8; // scss variables
  if (/^[.#]?[\w-]+\s*\{[^}]*\}/m.test(t)) return 0.5;
  return 0;
}

export const scssAdapter: LanguageAdapter = makePrettierAdapter({
  id: "scss",
  label: "SCSS",
  parser: "scss",
  prettierOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  toggles: markupPrettierToggles,
  detect: detectScss,
});
