import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { makePrettierAdapter, whitespaceCanonicalize } from "./code-format";

function detectGlimmer(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/\{\{#(if|each|let|with)\b/.test(input)) return 0.8;
  if (/\{\{!/.test(input)) return 0.6; // hbs comment
  if (/<[A-Z][\w-]*\s/.test(t)) return 0.4; // capitalized component
  return 0;
}

// Format-disabled: no npm Glimmer/Handlebars-template Prettier package exists.
// The diff uses whitespace-only canonical.
export const glimmerAdapter: LanguageAdapter = makePrettierAdapter({
  id: "glimmer",
  label: "Glimmer",
  parser: "glimmer",
  formatterDisabled: true,
  robust: (input, opts) => whitespaceCanonicalize(input, opts),
  detect: detectGlimmer,
});
