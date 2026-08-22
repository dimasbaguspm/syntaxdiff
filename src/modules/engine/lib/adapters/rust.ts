import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { whitespaceCanonicalize } from "./code-format";

function detectRust(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/\bfn\s+[\w]+/.test(input)) return 0.8;
  if (/\b(let\s+mut|impl|struct|enum|use\s+std|->)\b/.test(input)) return 0.5;
  return 0;
}

// Format-disabled: the Rust formatter plugin crashes against the current
// engine version ("Unexpected doc.type 'concat'"). The diff uses
// whitespace-only canonical.
export const rustAdapter: LanguageAdapter = {
  id: "rust",
  label: "Rust",
  fmtParser: "rust",
  formatterDisabled: true,
  detect: detectRust,
  toggles: [],
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
