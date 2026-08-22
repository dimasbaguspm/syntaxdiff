import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { codeFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectVue(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/<template[\s>]/.test(t)) return 1;
  if (/<script[\s>]/.test(t) && /<style[\s>]/.test(t)) return 0.9;
  if (/<\/?[a-zA-Z][\w-]*\s/.test(t) && /(v-|@|:)[\w-]*/.test(input)) return 0.7;
  return 0;
}

export const vueAdapter: LanguageAdapter = {
  id: "vue",
  label: "Vue",
  fmtParser: "vue",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectVue,
  toggles: codeFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
