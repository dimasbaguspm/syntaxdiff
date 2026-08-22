import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { makePrettierAdapter, whitespaceCanonicalize } from "./code-format";

function detectRust(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/\bfn\s+[\w]+/.test(input)) return 0.8;
  if (/\b(let\s+mut|impl|struct|enum|use\s+std|->)\b/.test(input)) return 0.5;
  return 0;
}

// Format-disabled: prettier-plugin-rust crashes against prettier 3.6.2
// ("Unexpected doc.type 'concat'"). The diff uses whitespace-only canonical.
export const rustAdapter: LanguageAdapter = makePrettierAdapter({
  id: "rust",
  label: "Rust",
  parser: "rust",
  formatterDisabled: true,
  robust: (input, opts) => whitespaceCanonicalize(input, opts),
  detect: detectRust,
});
