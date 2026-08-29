import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectScss(input: string): number {
  const t = input.trimStart();
  if (!t || t.length < 10) return 0;
  let score = 0;
  if (/\$[\w-]+\s*:\s*[^;]+;/.test(input)) score += 0.6; // $var: value;
  if (/\{[^{}]*:[^;{}]+;[^{}]*\}/.test(input)) score += 0.3;
  // Penalize Less-only syntax.
  if (/@[\w-]+\s*:\s*[^;]+;/.test(input) && !/\$/.test(input)) score -= 0.2;
  return Math.min(1, Math.max(0, score));
}

export const scssAdapter: LanguageAdapter = {
  id: "scss",
  label: "SCSS",
  fmtParser: "scss",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectScss,
  toggles: markupFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
