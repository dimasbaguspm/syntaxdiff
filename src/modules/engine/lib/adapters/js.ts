import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { codePrettierToggles, formatCode, makePrettierAdapter } from "./code-format";

/** Heuristic confidence that `input` is JavaScript (not TypeScript). */
function detectJs(input: string): number {
  if (!input.trim()) return 0;
  let score = 0;
  if (/\bfunction\b/.test(input)) score += 0.3;
  if (/\b(const|let|var)\b/.test(input)) score += 0.2;
  if (/(=>|\)\s*=>)/.test(input)) score += 0.2;
  if (/\bconsole\.(log|error|warn|info)\b/.test(input)) score += 0.2;
  if (/\b(export|import)\b/.test(input)) score += 0.1;
  // Penalize TS-only markers so `.ts` wins when both match.
  if (/(?:\binterface\b)|(?:\btype\s+\w+\s*=)|(?::\s*(?:string|number|boolean)\b)/.test(input))
    score -= 0.3;
  return Math.min(1, Math.max(0, score));
}

export const jsAdapter: LanguageAdapter = makePrettierAdapter({
  id: "js",
  label: "JavaScript",
  parser: "babel",
  prettierOptions: { semi: true, singleQuote: false, printWidth: 80, tabWidth: 2 },
  toggles: codePrettierToggles,
  robust: (input, opts) => formatCode(input, opts),
  detect: detectJs,
});
