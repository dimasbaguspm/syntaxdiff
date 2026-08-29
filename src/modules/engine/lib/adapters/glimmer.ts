import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { whitespaceCanonicalize } from "./code-format";

function detectGlimmer(input: string): number {
  const t = input.trimStart();
  if (!t || t.length < 10) return 0;
  let score = 0;
  if (/\{\{#(if|each|let|with)\b/.test(input)) score += 0.6;
  if (/\{\{!/.test(input)) score += 0.2; // hbs comment
  if (/<[A-Z][\w-]*\s/.test(input)) score += 0.2;
  // Require at least one Glimmer-specific {{# token.
  if (!/\{\{#(if|each|let|with)\b/.test(input)) score = Math.min(score, 0.3);
  return Math.min(0.9, Math.max(0, score));
}

// Format-disabled: no npm Glimmer/Handlebars-template formatter package exists.
// The diff uses whitespace-only canonical.
export const glimmerAdapter: LanguageAdapter = {
  id: "glimmer",
  label: "Glimmer",
  fmtParser: "glimmer",
  formatterDisabled: true,
  detect: detectGlimmer,
  toggles: [],
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
