import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectHtml(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/<(!doctype|html|head|body|div|span|p|a|ul|li|table|script|style)\b/i.test(t)) return 1;
  if (/<[a-zA-Z][\w-]*(\s[^>]*)?>/.test(input)) return 0.6;
  return 0;
}

export const htmlAdapter: LanguageAdapter = {
  id: "html",
  label: "HTML",
  fmtParser: "html",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectHtml,
  toggles: markupFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
