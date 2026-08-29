import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { codeFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectSh(input: string): number {
  const t = input.trimStart();
  if (!t || t.length < 5) return 0;
  if (/^#!\/bin\/(ba)?sh/m.test(t)) return 1;
  let score = 0;
  if (/\b(if|for|while|case|function)\b.*\b(then|do|esac|fi)\b/.test(input)) score += 0.6;
  if (/\b(echo|export|source|alias)\b/.test(input)) score += 0.2;
  if (/\$\{?\w+\}?/.test(input) || /\|\|/.test(input) || /&&/.test(input)) score += 0.2;
  if (score < 0.4) return 0;
  return Math.min(1, score);
}

export const shAdapter: LanguageAdapter = {
  id: "sh",
  label: "Shell",
  fmtParser: "sh",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectSh,
  toggles: codeFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
