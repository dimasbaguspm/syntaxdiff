import { parse, stringify } from "smol-toml";
import { ParseError } from "@/modules/engine/lib/types";
import type { FormatOptions, FormatResult, LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles } from "./code-format";

/** Parse + re-serialize WITHOUT key-sort (key order preserved). Throws on
 *  invalid TOML. */
function tomlCanonical(input: string, _opts: FormatOptions): FormatResult {
  let v: unknown;
  try {
    v = parse(input);
  } catch (e) {
    throw new ParseError(`Invalid TOML: ${(e as Error).message}`);
  }
  return { canonical: stringify(v as Record<string, unknown>) };
}

function detectToml(input: string): number {
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
}

export const tomlAdapter: LanguageAdapter = {
  id: "toml",
  label: "TOML",
  fmtParser: "toml",
  fmtOptions: { tabWidth: 2, printWidth: 80 },
  detect: detectToml,
  toggles: markupFmtToggles,
  format: tomlCanonical,
};

export { parse as parseToml };
