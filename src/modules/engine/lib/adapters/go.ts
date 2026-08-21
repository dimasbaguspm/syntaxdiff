import type { FormatOptions, LanguageAdapter } from "@/modules/engine/lib/types";
import { codeToggles, formatCode } from "./code-format";

/** Heuristic confidence that `input` is Go. */
function detectGo(input: string): number {
  if (!input.trim()) return 0;
  let score = 0;
  if (/^package\s+\w+/m.test(input)) score += 0.4;
  if (/\bfunc\b\s/.test(input)) score += 0.3;
  if (/import\s+"[^"]+"/.test(input)) score += 0.15;
  if (/:=/.test(input)) score += 0.15;
  // Avoid being out-scored by JS/TS-ish input.
  if (/(?:\binterface\b)|(?:\btype\s+\w+\s*=)|(?:=>)/.test(input)) score -= 0.2;
  return Math.min(1, Math.max(0, score));
}

export const goAdapter: LanguageAdapter = {
  id: "go",
  label: "Go",
  detect(input: string): number {
    return detectGo(input);
  },
  toggles: [...codeToggles],
  format(input: string, opts: FormatOptions) {
    return formatCode(input, opts);
  },
};
