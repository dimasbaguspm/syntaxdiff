import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { makePrettierAdapter, markupPrettierToggles } from "./code-format";

function detectJson5(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (t.startsWith("{") || t.startsWith("[")) {
    try {
      JSON.parse(input);
      return 1;
    } catch {
      return 0.6;
    }
  }
  return 0;
}

export const json5Adapter: LanguageAdapter = makePrettierAdapter({
  id: "json5",
  label: "JSON5",
  parser: "json5",
  prettierOptions: { tabWidth: 2, printWidth: 80 },
  robust: (input, _opts) => ({ canonical: JSON.stringify(JSON.parse(input), null, 2) }),
  toggles: markupPrettierToggles,
  detect: detectJson5,
});
