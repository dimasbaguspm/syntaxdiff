import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { codeFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectAngular(input: string): number {
  const t = input.trimStart();
  if (!t || t.length < 15) return 0;
  let score = 0;
  if (/@(Component|NgModule|Injectable|Directive)\s*\(/.test(input)) score += 0.7;
  if (/\*ng(If|For|Switch|Class|Style)/.test(input)) score += 0.3;
  if (/\[[\w-]+\]\s*=/.test(input) && /<[a-z][\w-]*[\s\S]*?>/.test(input)) score += 0.2;
  if (score === 0) return 0;
  return Math.min(1, score);
}

export const angularAdapter: LanguageAdapter = {
  id: "angular",
  label: "Angular",
  fmtParser: "angular",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectAngular,
  toggles: codeFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
