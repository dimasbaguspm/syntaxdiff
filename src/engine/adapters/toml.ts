import { parse, stringify } from "smol-toml";
import { ParseError } from "../types";
import type { FormatOptions, LanguageAdapter } from "../types";
import { canonicalize } from "../canonical";

export const tomlAdapter: LanguageAdapter = {
  id: "toml",
  label: "TOML",
  detect(input: string): number {
    const t = input.trimStart();
    if (!t) return 0;
    // `key = value`, `[table]`, or `[["array.of.tables"]]`
    if (/^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*\s*=/m.test(t) || /^\[{1,2}[\w. -]+\]{1,2}/m.test(t)) {
      try {
        parse(input);
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
      v = parse(input);
    } catch (e) {
      throw new ParseError(`Invalid TOML: ${(e as Error).message}`);
    }
    const canonical = canonicalize(v, opts.sortKeys === true);
    return { canonical: stringify(canonical) };
  },
};
