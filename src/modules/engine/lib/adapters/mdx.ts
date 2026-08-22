import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { makePrettierAdapter, markupPrettierToggles } from "./code-format";

function detectMdx(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/^#{1,6}\s/m.test(t)) return 0.5;
  if (/<[A-Z][\w.]*[\s\S]*?<\/[A-Z][\w.]*>/.test(input)) return 0.6; // JSX element
  if (/export\s+(default\s+)?(const|function)/.test(input)) return 0.5;
  return 0;
}

export const mdxAdapter: LanguageAdapter = makePrettierAdapter({
  id: "mdx",
  label: "MDX",
  parser: "mdx",
  prettierOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  toggles: markupPrettierToggles,
  detect: detectMdx,
});
