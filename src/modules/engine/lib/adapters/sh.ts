import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { codePrettierToggles, makePrettierAdapter } from "./code-format";

function detectSh(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/^#!\/bin\/(ba)?sh/m.test(t)) return 1;
  if (/\b(if|for|while|case)\s+.*;\s*then/.test(input)) return 0.7;
  if (/\b(echo|export|source|\$\w+|&&|\|\|)\b/.test(input) && /`/.test(input)) return 0.6;
  return 0;
}

export const shAdapter: LanguageAdapter = makePrettierAdapter({
  id: "sh",
  label: "Shell",
  parser: "sh",
  plugins: ["prettier-plugin-sh"],
  prettierOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  toggles: codePrettierToggles,
  detect: detectSh,
});
