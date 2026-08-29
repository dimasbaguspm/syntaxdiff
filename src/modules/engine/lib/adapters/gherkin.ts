import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectGherkin(input: string): number {
  const t = input.trimStart();
  if (!t || t.length < 10) return 0;
  if (/^\s*Feature\s*:/m.test(t)) return 1;
  let score = 0;
  if (/^\s*Scenario( Outline)?:/m.test(input)) score += 0.5;
  if (/^\s*(Given|When|Then|And|But)\b/m.test(input)) score += 0.4;
  if (score === 0) return 0;
  return Math.min(0.9, score);
}

export const gherkinAdapter: LanguageAdapter = {
  id: "gherkin",
  label: "Gherkin",
  fmtParser: "gherkin",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectGherkin,
  toggles: markupFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
