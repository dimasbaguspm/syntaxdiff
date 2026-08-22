import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { makePrettierAdapter, whitespaceCanonicalize } from "./code-format";

function detectKotlin(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/\bfun\s+[\w]+/.test(input)) return 0.8;
  if (/\b(val|var)\s+[\w]+/.test(input)) return 0.5;
  if (/\b(class|object|interface)\s+[\w]+/.test(input)) return 0.4;
  return 0;
}

// Format-disabled: the Kotlin Prettier plugin crashes against prettier 3.6.2.
// The diff uses whitespace-only canonical.
export const kotlinAdapter: LanguageAdapter = makePrettierAdapter({
  id: "kotlin",
  label: "Kotlin",
  parser: "kotlin",
  formatterDisabled: true,
  robust: (input, opts) => whitespaceCanonicalize(input, opts),
  detect: detectKotlin,
});
