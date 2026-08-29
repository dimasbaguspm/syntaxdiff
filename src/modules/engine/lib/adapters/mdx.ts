import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectMdx(input: string): number {
  const t = input.trimStart();
  if (!t || t.length < 15) return 0;
  let score = 0;
  const hasMd = /^#{1,6}\s+\S/m.test(input) || /```/.test(input);
  const hasJsx = /<[A-Z][\w.]*(\s[^>]*)?>[\s\S]*?<\/[A-Z][\w.]*>/.test(input);
  const hasExport = /export\s+(default\s+)?(const|function|class)\b/.test(input);
  if (hasMd && hasJsx) score += 0.7;
  else if (hasJsx && hasExport) score += 0.6;
  else if (hasMd && hasExport) score += 0.5;
  else if (hasJsx) score += 0.3;
  else if (hasExport && /^import\s/m.test(input)) score += 0.2;
  return Math.min(1, score);
}

export const mdxAdapter: LanguageAdapter = {
  id: "mdx",
  label: "MDX",
  fmtParser: "mdx",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectMdx,
  toggles: markupFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
