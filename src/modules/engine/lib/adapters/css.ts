import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectCss(input: string): number {
  const t = input.trimStart();
  if (!t || t.length < 15) return 0;
  // Reject Less/Scss variable syntax so they outrank plain CSS.
  if (/^\s*\$[\w-]+\s*:/m.test(input) || /^\s*@[\w-]+\s*:/m.test(input)) return 0;
  const hasBlock = /\{[^{}]*:[^;{}]+;[^{}]*\}/.test(input);
  const declCount = (input.match(/[a-z-]+\s*:\s*[^;{}]+;/gi) ?? []).length;
  if (hasBlock && declCount >= 2) return 1;
  if (hasBlock && declCount >= 1) return 0.7;
  return 0;
}

export const cssAdapter: LanguageAdapter = {
  id: "css",
  label: "CSS",
  fmtParser: "css",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectCss,
  toggles: markupFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
