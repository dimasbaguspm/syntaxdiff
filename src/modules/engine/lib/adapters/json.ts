import { ParseError } from "@/modules/engine/lib/types";
import type { FormatOptions, LanguageAdapter } from "@/modules/engine/lib/types";
import { canonicalize } from "@/modules/engine/lib/canonical";

function parse(input: string): unknown {
  try {
    return JSON.parse(input) as unknown;
  } catch (e) {
    throw new ParseError(`Invalid JSON: ${(e as Error).message}`);
  }
}

export const jsonAdapter: LanguageAdapter = {
  id: "json",
  label: "JSON",
  detect(input: string): number {
    const t = input.trimStart();
    if (!t) return 0;
    if (t.startsWith("{") || t.startsWith("[")) {
      try {
        JSON.parse(input);
        return 1;
      } catch {
        return 0.6; // looks like JSON but malformed — still surface it
      }
    }
    return 0;
  },
  toggles: [
    { id: "prettify", label: "Prettify", default: true },
    { id: "sortKeys", label: "Alphabetize keys (recursive)", default: true },
    { id: "minify", label: "Minify" },
  ],
  format(input: string, opts: FormatOptions) {
    const value = parse(input);
    const canonical = canonicalize(value, opts.sortKeys === true);
    const pretty = opts.minify ? 0 : opts.prettify === false ? 0 : 2;
    return { canonical: JSON.stringify(canonical, null, pretty) };
  },
};
