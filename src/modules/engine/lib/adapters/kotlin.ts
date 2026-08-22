import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { whitespaceCanonicalize } from "./code-format";

function detectKotlin(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/\bfun\s+[\w]+/.test(input)) return 0.8;
  if (/\b(val|var)\s+[\w]+/.test(input)) return 0.5;
  if (/\b(class|object|interface)\s+[\w]+/.test(input)) return 0.4;
  return 0;
}

// Format-disabled: the Kotlin formatter plugin crashes in the browser runtime.
// The diff uses whitespace-only canonical.
export const kotlinAdapter: LanguageAdapter = {
  id: "kotlin",
  label: "Kotlin",
  fmtParser: "kotlin",
  formatterDisabled: true,
  detect: detectKotlin,
  toggles: [],
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
