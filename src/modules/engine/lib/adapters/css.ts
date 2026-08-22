import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { makePrettierAdapter, markupPrettierToggles } from "./code-format";

function detectCss(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  // selector { ... } structure
  if (/^[.#]?[\w-]+\s*\{[^}]*\}/m.test(t)) return 1;
  if (/:[a-z-]+\s*;/m.test(t)) return 0.5;
  return 0;
}

export const cssAdapter: LanguageAdapter = makePrettierAdapter({
  id: "css",
  label: "CSS",
  parser: "css",
  prettierOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  toggles: markupPrettierToggles,
  detect: detectCss,
});
