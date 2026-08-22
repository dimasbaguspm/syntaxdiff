import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { makePrettierAdapter, markupPrettierToggles } from "./code-format";

function detectHtml(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/<(!doctype|html|head|body|div|span|p|a|ul|li|table|script|style)\b/i.test(t)) return 1;
  if (/<[a-zA-Z][\w-]*(\s[^>]*)?>/.test(input)) return 0.6;
  return 0;
}

export const htmlAdapter: LanguageAdapter = makePrettierAdapter({
  id: "html",
  label: "HTML",
  parser: "html",
  prettierOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  toggles: markupPrettierToggles,
  detect: detectHtml,
});
