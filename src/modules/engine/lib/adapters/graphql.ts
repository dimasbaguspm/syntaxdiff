import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectGraphql(input: string): number {
  const t = input.trimStart();
  if (!t || t.length < 15) return 0;
  let score = 0;
  if (/^(type|interface|enum|input|scalar|union|schema)\s+\w+/m.test(t)) score += 0.6;
  if (/\b(query|mutation|subscription|fragment)\s+\w*/.test(input)) score += 0.3;
  if (/\{[\s\S]*:[\s\S]*\}/.test(input) && score > 0) score += 0.2;
  if (score === 0) return 0;
  return Math.min(1, score);
}

export const graphqlAdapter: LanguageAdapter = {
  id: "graphql",
  label: "GraphQL",
  fmtParser: "graphql",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectGraphql,
  toggles: markupFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};
