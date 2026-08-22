import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { formatCode } from "./code-format";

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

// NOTE (FE #12): gofmt has no robust, worker-friendly pure-JS port, so Go is
// formatter-disabled — the diff uses the robust whitespace canonical text and
// there is no user-facing async formatter.
export const goAdapter: LanguageAdapter = {
  id: "go",
  label: "Go",
  // No built-in parser; formatterDisabled short-circuits the worker pass.
  fmtParser: "go",
  formatterDisabled: true,
  detect: detectGo,
  toggles: [],
  format: (input, opts) => formatCode(input, opts),
};
