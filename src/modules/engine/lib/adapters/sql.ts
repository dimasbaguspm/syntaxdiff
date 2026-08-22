import { format, type SqlLanguage } from "sql-formatter";
import { ParseError } from "@/modules/engine/lib/types";
import type { FormatOptions, FormatResult, LanguageAdapter } from "@/modules/engine/lib/types";
import { codeFmtToggles } from "./code-format";

/** Supported SQL dialects (see sql-formatter). */
export const SQL_DIALECTS = [
  "sql",
  "mysql",
  "postgresql",
  "sqlite",
  "mssql",
  "mariadb",
  "plsql",
  "bigquery",
  "snowflake",
  "cockroachdb",
] as const;

const DIALECT_SET = new Set<string>(SQL_DIALECTS);

/** Resolve a user-supplied dialect to a known one, defaulting to "sql". */
function resolveDialect(dialect: unknown): SqlLanguage {
  return typeof dialect === "string" && DIALECT_SET.has(dialect) ? (dialect as SqlLanguage) : "sql";
}

/** First-token keywords that strongly indicate the input is SQL. */
const SQL_KEYWORDS = /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH|SET|MERGE)\b/;

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
    return SQL_KEYWORDS.test(input.trimStart().toUpperCase()) ? 1 : 0;
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
