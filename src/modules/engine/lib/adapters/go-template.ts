import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { codePrettierToggles, makePrettierAdapter } from "./code-format";

function detectGoTemplate(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/\{\{(?:if|range|with|block|define|template|end)\b/.test(input)) return 0.9;
  if (/\{\{\s*\.\w+/.test(input)) return 0.6;
  return 0;
}

export const goTemplateAdapter: LanguageAdapter = makePrettierAdapter({
  id: "go-template",
  label: "Go Template",
  parser: "go-template",
  plugins: ["@htnabe/prettier-plugin-go-template"],
  prettierOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  toggles: codePrettierToggles,
  detect: detectGoTemplate,
});
