import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { codeFmtToggles, formatCode } from "./code-format";

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

// NOTE (FE #12): the PHP formatter plugin needs the PHP binary at runtime. In a
// browser/worker there is no PHP runtime, so the async pass falls back to the
// robust whitespace canonical text — documented best-effort rather than a
// fabricated result. Enabled (not formatterDisabled) so the Format button stays
// available; it simply no-ops the real formatter when the binary is absent.
export const phpAdapter: LanguageAdapter = {
  id: "php",
  label: "PHP",
  fmtParser: "php",
  fmtOptions: { printWidth: 80, tabWidth: 2 },
  detect: detectPhp,
  toggles: codeFmtToggles,
  format: (input, opts) => formatCode(input, opts),
};
