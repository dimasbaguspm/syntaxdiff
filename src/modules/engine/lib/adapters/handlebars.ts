import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectHandlebars(input: string): number {
  const t = input.trimStart();
  if (!t || t.length < 10) return 0;
  const openCount = (input.match(/\{\{/g) ?? []).length;
  const closeCount = (input.match(/\}\}/g) ?? []).length;
  if (openCount === 0 || closeCount === 0) return 0;
  // Penalize Glimmer/go-template specific block syntax so they outrank.
  if (/\{\{#(if|each|let|with)\b/.test(input)) return 0.4;
  if (/\{\{(?:if|range|with|block|define)\b/.test(input)) return 0.3;
  if (/\{\{[#/!>]?\s*\w+/.test(input)) return 0.9;
  return 0;
}

export const handlebarsAdapter: LanguageAdapter = {
  id: "handlebars",
  label: "Handlebars",
  fmtParser: "handlebars",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectHandlebars,
  toggles: markupFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
