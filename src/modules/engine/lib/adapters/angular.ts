import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { codePrettierToggles, makePrettierAdapter } from "./code-format";

function detectAngular(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/@(Component|NgModule|Injectable|Directive)\s*\(/.test(input)) return 1;
  if (/\*ng(If|For|Switch)/.test(input)) return 0.7;
  if (/<[a-z][\w-]*([\s\S]*?)<\/[a-z][\w-]*>/.test(input) && /\[[\w-]+\]=/.test(input)) return 0.6;
  return 0;
}

export const angularAdapter: LanguageAdapter = makePrettierAdapter({
  id: "angular",
  label: "Angular",
  parser: "angular",
  prettierOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  toggles: codePrettierToggles,
  detect: detectAngular,
});
