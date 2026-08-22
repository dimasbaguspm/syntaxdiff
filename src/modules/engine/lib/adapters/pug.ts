import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectPug(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  // Indentation-driven: a tag/class/id token at column 0, no closing braces.
  if (/^[a-z0-9.#][\w.#-]*(\s+[\w-]+=[^\n]*)?$/m.test(t) && !/[{};]/.test(t)) return 0.7;
  if (/^\s*\w[\w-]*\.\s/m.test(t)) return 0.5;
  return 0;
}

export const pugAdapter: LanguageAdapter = {
  id: "pug",
  label: "Pug",
  fmtParser: "pug",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectPug,
  toggles: markupFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
