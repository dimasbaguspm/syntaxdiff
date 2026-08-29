import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { codeFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectAstro(input: string): number {
  const t = input.trimStart();
  if (!t || t.length < 10) return 0;
  const lines = input.split("\n");
  const hasFrontmatter =
    lines[0]?.trim() === "---" && lines.slice(1).some((l) => l.trim() === "---");
  if (!hasFrontmatter) return 0;
  // Frontmatter + component markup is a strong Astro signal; frontmatter alone is weaker.
  let score = 0.5;
  if (/<[A-Za-z][\w-]*\b/.test(input)) score += 0.3;
  if (/import\s+[^\n]*\.astro|from\s+["'].*astro/.test(input)) score += 0.2;
  return Math.min(1, score);
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
