import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { codeFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectAstro(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/^---\s*$/m.test(t) && /---\s*$/m.test(input)) return 1; // frontmatter fences
  if (/<\/?[a-zA-Z][\w-]*\s/.test(t)) return 0.5;
  return 0;
}

export const astroAdapter: LanguageAdapter = {
  id: "astro",
  label: "Astro",
  fmtParser: "astro",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectAstro,
  toggles: codeFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
