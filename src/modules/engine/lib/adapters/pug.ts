import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectPug(input: string): number {
  const t = input.trimStart();
  if (!t || t.length < 10) return 0;
  if (/[{};]/.test(input) || /<\/?[a-zA-Z]/.test(input)) return 0;
  const lines = input.split("\n").filter((l) => l.trim() !== "");
  if (lines.length < 2) return 0;
  let indented = 0;
  for (const l of lines) if (/^\s{2,}\S/.test(l)) indented++;
  const tagLike = lines.filter((l) => /^[a-z][\w-]*(\s+[\w-]+=[^\n]*)?$/.test(l.trim())).length;
  if (indented >= 1 && tagLike >= 2) return 0.85;
  if (tagLike >= 2) return 0.5;
  return 0;
}

export const pugAdapter: LanguageAdapter = {
  id: "pug",
  label: "Pug",
  fmtParser: "pug",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectPug,
  toggles: markupFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
