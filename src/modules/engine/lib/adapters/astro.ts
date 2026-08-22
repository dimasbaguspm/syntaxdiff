import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { codePrettierToggles, makePrettierAdapter } from "./code-format";

function detectAstro(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/^---\s*$/m.test(t) && /---\s*$/m.test(input)) return 1; // frontmatter fences
  if (/<\/?[a-zA-Z][\w-]*\s/.test(t)) return 0.5;
  return 0;
}

export const astroAdapter: LanguageAdapter = makePrettierAdapter({
  id: "astro",
  label: "Astro",
  parser: "astro",
  plugins: ["prettier-plugin-astro"],
  prettierOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  toggles: codePrettierToggles,
  detect: detectAstro,
});
