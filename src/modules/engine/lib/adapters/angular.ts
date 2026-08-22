import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { codeFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectAngular(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/@(Component|NgModule|Injectable|Directive)\s*\(/.test(input)) return 1;
  if (/\*ng(If|For|Switch)/.test(input)) return 0.7;
  if (/<[a-z][\w-]*([\s\S]*?)<\/[a-z][\w-]*>/.test(input) && /\[[\w-]+\]=/.test(input)) return 0.6;
  return 0;
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
