import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { codePrettierToggles, makePrettierAdapter } from "./code-format";

function detectVue(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/<template[\s>]/.test(t)) return 1;
  if (/<script[\s>]/.test(t) && /<style[\s>]/.test(t)) return 0.9;
  if (/<\/?[a-zA-Z][\w-]*\s/.test(t) && /(v-|@|:)[\w-]*/.test(input)) return 0.7;
  return 0;
}

export const vueAdapter: LanguageAdapter = makePrettierAdapter({
  id: "vue",
  label: "Vue",
  parser: "vue",
  prettierOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  toggles: codePrettierToggles,
  detect: detectVue,
});
