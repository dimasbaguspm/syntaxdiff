import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectGherkin(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/^\s*Feature\s*:/m.test(t)) return 1;
  if (/^\s*(Scenario|Scenario Outline|Given|When|Then|And|But)\s/.test(t)) return 0.8;
  return 0;
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
