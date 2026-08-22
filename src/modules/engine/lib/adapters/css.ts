import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectCss(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  // selector { ... } structure
  if (/^[.#]?[\w-]+\s*\{[^}]*\}/m.test(t)) return 1;
  if (/:[a-z-]+\s*;/m.test(t)) return 0.5;
  return 0;
}

export const cssAdapter: LanguageAdapter = {
  id: "css",
  label: "CSS",
  fmtParser: "css",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectCss,
  toggles: markupFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
