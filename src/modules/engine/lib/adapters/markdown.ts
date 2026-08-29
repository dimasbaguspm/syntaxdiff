import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectMarkdown(input: string): number {
  const t = input.trimStart();
  if (!t || t.length < 10) return 0;
  let signals = 0;
  if (/^#{1,6}\s+\S/m.test(input)) signals++;
  if (/^\s*[-*+]\s+\S/m.test(input)) signals++;
  if (/^\s*\d+\.\s+\S/m.test(input)) signals++;
  if (/\[[^\]]+\]\([^)]+\)/.test(input)) signals++;
  if (/```\w*\n[\s\S]*?```/.test(input)) signals++;
  if (/^>\s+\S/m.test(input)) signals++;
  // Single weak inline emphasis is noisy — require at least 2 signals.
  if (signals >= 3) return 0.9;
  if (signals === 2) return 0.65;
  if (signals === 1) return 0.25;
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
