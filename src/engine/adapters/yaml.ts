import { dump, load } from "js-yaml";
import { ParseError } from "../types";
import type { FormatOptions, LanguageAdapter } from "../types";
import { canonicalize } from "../canonical";

export const yamlAdapter: LanguageAdapter = {
  id: "yaml",
  label: "YAML",
  detect(input: string): number {
    const t = input.trimStart();
    if (!t) return 0;
    // Mapping `key:` or list `- ` (or leading --- document marker)
    if (
      /^---\s*$/.test(t.split("\n")[0] ?? "") ||
      /^[\w"'.$@-]+:\s/m.test(input) ||
      /^-\s+/m.test(input)
    ) {
      try {
        load(input);
        return 1;
      } catch {
        return 0.3;
      }
    }
    return 0;
  },
  toggles: [{ id: "sortKeys", label: "Alphabetize keys (recursive)", default: true }],
  format(input: string, opts: FormatOptions) {
    let v: unknown;
    try {
      v = load(input);
    } catch (e) {
      throw new ParseError(`Invalid YAML: ${(e as Error).message}`);
    }
    const canonical = canonicalize(v, opts.sortKeys === true);
    return { canonical: dump(canonical) };
  },
};
