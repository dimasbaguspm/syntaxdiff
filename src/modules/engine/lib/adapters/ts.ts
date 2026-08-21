import type { FormatOptions, LanguageAdapter } from "@/modules/engine/lib/types";
import { codeToggles, formatCode, formatCodeAsync } from "./code-format";

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

export const tsAdapter: LanguageAdapter = {
  id: "ts",
  label: "TypeScript",
  detect(input: string): number {
    return detectTs(input);
  },
  toggles: [...codeToggles],
  format(input: string, opts: FormatOptions) {
    return formatCode(input, opts);
  },
  // Real formatter pass (Prettier `babel-ts`); see `formatCodeAsync`.
  async formatAsync(input: string, opts: FormatOptions) {
    return formatCodeAsync(input, opts, "ts");
  },
};
