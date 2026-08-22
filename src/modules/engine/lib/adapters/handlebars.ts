import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { makePrettierAdapter, markupPrettierToggles } from "./code-format";

function detectHandlebars(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/\{\{[#/!>]?\s*\w/.test(input)) return 0.9;
  if (/<\/?[a-zA-Z][\w-]*(\s[^>]*)?>/.test(t)) return 0.5; // mixed with HTML
  return 0;
}

export const handlebarsAdapter: LanguageAdapter = makePrettierAdapter({
  id: "handlebars",
  label: "Handlebars",
  parser: "handlebars",
  plugins: ["@poliklot/prettier-plugin-handlebars"],
  prettierOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  toggles: markupPrettierToggles,
  detect: detectHandlebars,
});
