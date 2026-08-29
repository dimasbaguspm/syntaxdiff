import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectHtml(input: string): number {
  const t = input.trimStart();
  if (!t || t.length < 15) return 0;
  if (/<!doctype\s+html/i.test(t)) return 1;
  const tagCount = (input.match(/<\/?[a-zA-Z][\w-]*\b[^>]*>/g) ?? []).length;
  const hasClose = /<\/[a-zA-Z][\w-]*>/.test(input);
  if (tagCount >= 3 && hasClose) return 0.9;
  if (tagCount >= 2 && hasClose) return 0.7;
  if (
    tagCount >= 1 &&
    hasClose &&
    /<(html|head|body|div|span|p|a|ul|li|table|script|style)\b/i.test(t)
  )
    return 0.8;
  return 0;
}

export const htmlAdapter: LanguageAdapter = {
  id: "html",
  label: "HTML",
  fmtParser: "html",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectHtml,
  toggles: markupFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
