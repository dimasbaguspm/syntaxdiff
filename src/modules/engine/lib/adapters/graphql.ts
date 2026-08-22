import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectGraphql(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (
    /^\s*(type|interface|enum|input|scalar|union|schema|query|mutation|subscription)\s+[\w]+/.test(
      t,
    )
  )
    return 1;
  if (/^\{/m.test(t) && /\b(query|mutation|fragment)\b/.test(input)) return 0.6;
  return 0;
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
