import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { makePrettierAdapter, whitespaceCanonicalize } from "./code-format";

function detectRuby(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/\b(def|end|do\s*\|[\w, ]*\|)\b/.test(input)) return 0.8;
  if (/\b(class|module|require|attr_accessor)\b/.test(input)) return 0.5;
  return 0;
}

// Format-disabled: the Ruby Prettier plugin shells out to the Ruby binary, which
// is unavailable in a browser/worker. The diff uses whitespace-only canonical.
export const rubyAdapter: LanguageAdapter = makePrettierAdapter({
  id: "ruby",
  label: "Ruby",
  parser: "ruby",
  formatterDisabled: true,
  robust: (input, opts) => whitespaceCanonicalize(input, opts),
  detect: detectRuby,
});
