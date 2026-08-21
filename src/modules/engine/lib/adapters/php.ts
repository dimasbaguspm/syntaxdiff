import type { FormatOptions, LanguageAdapter } from "@/modules/engine/lib/types";
import { codeToggles, formatCode, formatCodeAsync } from "./code-format";

/** Heuristic confidence that `input` is PHP. */
function detectPhp(input: string): number {
  if (!input.trim()) return 0;
  let score = 0;
  if (/<\?php/i.test(input)) score += 0.5;
  if (/\bfunction\s+\w+\s*\(/.test(input)) score += 0.2;
  if (/\becho\b/.test(input)) score += 0.15;
  if (/\$\w+/.test(input)) score += 0.15;
  return Math.min(1, Math.max(0, score));
}

export const phpAdapter: LanguageAdapter = {
  id: "php",
  label: "PHP",
  detect(input: string): number {
    return detectPhp(input);
  },
  toggles: [...codeToggles],
  format(input: string, opts: FormatOptions) {
    return formatCode(input, opts);
  },
  // NOTE (FE #12): `@prettier/plugin-php` requires the PHP binary at runtime
  // (not worker/browser-friendly), so PHP uses the best-effort whitespace
  // canonicalizer. `formatAsync` still resolves to the canonical text.
  async formatAsync(input: string, opts: FormatOptions) {
    return formatCodeAsync(input, opts, "php");
  },
};
