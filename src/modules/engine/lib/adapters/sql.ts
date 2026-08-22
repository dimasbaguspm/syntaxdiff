import { format } from "sql-formatter";
import { ParseError } from "@/modules/engine/lib/types";
import type { FormatOptions, FormatResult, LanguageAdapter } from "@/modules/engine/lib/types";
import { codeFmtToggles } from "./code-format";
import { detectSql, resolveDialect, SQL_DIALECTS } from "./shared-detect";

/** Robust canonicalization via sql-formatter (used directly and as the
 *  worker-side fallback). Throws `ParseError` on invalid SQL. */
function sqlCanonical(input: string, opts: FormatOptions): FormatResult {
  if (input.trim() === "") return { canonical: "" };
  try {
    return {
      canonical: format(input, {
        language: resolveDialect(opts.language ?? opts.dialect),
        keywordCase: opts.uppercaseKeywords === false ? "preserve" : "upper",
      }),
    };
  } catch (e) {
    throw new ParseError(`Invalid SQL: ${(e as Error).message}`);
  }
}

export const sqlAdapter: LanguageAdapter = {
  id: "sql",
  label: "SQL",
  fmtParser: "sql",
  fmtOptions: { language: "sql", printWidth: 80, tabWidth: 2, useTabs: false },
  detect(input: string): number {
    return detectSql(input);
  },
  toggles: [
    {
      id: "language",
      label: "Dialect",
      type: "select",
      options: [...SQL_DIALECTS],
      default: "sql",
    },
    { id: "uppercaseKeywords", label: "Uppercase keywords", default: true },
    ...codeFmtToggles,
  ],
  format: sqlCanonical,
};
