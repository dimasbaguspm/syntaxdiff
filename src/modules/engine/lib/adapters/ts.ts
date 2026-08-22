import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { codePrettierToggles, formatCode, makePrettierAdapter } from "./code-format";

/** Heuristic confidence that `input` is TypeScript. */
function detectTs(input: string): number {
  if (!input.trim()) return 0;
  let score = 0;
  if (/\binterface\b/.test(input)) score += 0.4;
  if (/\btype\s+\w+\s*=/.test(input)) score += 0.3;
  if (/:\s*(?:string|number|boolean|void|any)\b/.test(input)) score += 0.2;
  if (/<[A-Z]\w*>/.test(input)) score += 0.2; // generics
  if (/\b(export|import)\b/.test(input)) score += 0.1;
  if (/\bfunction\b/.test(input)) score += 0.1;
  return Math.min(1, Math.max(0, score));
}

export const tsAdapter: LanguageAdapter = makePrettierAdapter({
  id: "ts",
  label: "TypeScript",
  parser: "babel-ts",
  prettierOptions: { semi: true, singleQuote: false, printWidth: 80, tabWidth: 2 },
  toggles: codePrettierToggles,
  robust: (input, opts) => formatCode(input, opts),
  detect: detectTs,
});
