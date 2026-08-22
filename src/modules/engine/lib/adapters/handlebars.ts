import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectHandlebars(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/\{\{[#/!>]?\s*\w/.test(input)) return 0.9;
  if (/<\/?[a-zA-Z][\w-]*(\s[^>]*)?>/.test(t)) return 0.5; // mixed with HTML
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
