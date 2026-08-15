import { format } from "sql-formatter";
import { ParseError } from "../types";
import type { FormatOptions, LanguageAdapter } from "../types";

export const sqlAdapter: LanguageAdapter = {
  id: "sql",
  label: "SQL",
  detect(input: string): number {
    const t = input.trimStart().toUpperCase();
    if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH|SET|MERGE)\b/.test(t)) {
      return 1;
    }
    return 0;
  },
  toggles: [{ id: "uppercaseKeywords", label: "Uppercase keywords", default: true }],
  format(input: string, opts: FormatOptions) {
    try {
      return {
        canonical: format(input, {
          keywordCase: opts.uppercaseKeywords === false ? "preserve" : "upper",
        }),
      };
    } catch (e) {
      throw new ParseError(`Invalid SQL: ${(e as Error).message}`);
    }
  },
};
