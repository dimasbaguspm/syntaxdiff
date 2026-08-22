import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { codeFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectJava(input: string): number {
  if (!input.trim()) return 0;
  let score = 0;
  if (/\bpublic\s+(class|interface|enum)\b/.test(input)) score += 0.5;
  if (/\b(void|int|String|boolean)\b/.test(input)) score += 0.2;
  if (/\b(new|return|import\s+java)\b/.test(input)) score += 0.2;
  if (/;\s*$/m.test(input)) score += 0.1;
  return Math.min(1, score);
}

export const javaAdapter: LanguageAdapter = {
  id: "java",
  label: "Java",
  fmtParser: "java",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectJava,
  toggles: codeFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
