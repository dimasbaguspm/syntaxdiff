import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectMarkdown(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/^#{1,6}\s/m.test(t)) return 0.7;
  if (/^\s*[-*]\s+/m.test(t) || /^\s*\d+\.\s+/m.test(t)) return 0.5;
  if (/\[[^\]]+\]\([^)]+\)/.test(t)) return 0.4;
  if (/[*_]{1,3}[^*]+[*_]{1,3}/.test(t)) return 0.3;
  return 0;
}

export const markdownAdapter: LanguageAdapter = {
  id: "markdown",
  label: "Markdown",
  fmtParser: "markdown",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectMarkdown,
  toggles: markupFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
