import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { codeFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectGoTemplate(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/\{\{(?:if|range|with|block|define|template|end)\b/.test(input)) return 0.9;
  if (/\{\{\s*\.\w+/.test(input)) return 0.6;
  return 0;
}

export const goTemplateAdapter: LanguageAdapter = {
  id: "go-template",
  label: "Go Template",
  fmtParser: "go-template",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectGoTemplate,
  toggles: codeFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
