import { format, type SqlLanguage } from "sql-formatter";
import { ParseError } from "../types";
import type { FormatOptions, LanguageAdapter } from "../types";

/** Supported SQL dialects (see sql-formatter). Unknown values fall back to "sql". */
const DIALECTS = [
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

const DIALECT_SET = new Set<string>(DIALECTS);

/** First-token keywords that strongly indicate the input is SQL. */
const SQL_KEYWORDS = /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH|SET|MERGE)\b/;

/** Resolve a user-supplied dialect to a known one, defaulting to "sql". */
function resolveDialect(dialect: unknown): SqlLanguage {
  return typeof dialect === "string" && DIALECT_SET.has(dialect) ? (dialect as SqlLanguage) : "sql";
}

export const sqlAdapter: LanguageAdapter = {
  id: "sql",
  label: "SQL",
  detect(input: string): number {
    return SQL_KEYWORDS.test(input.trimStart().toUpperCase()) ? 1 : 0;
  },
  toggles: [
    { id: "uppercaseKeywords", label: "Uppercase keywords", default: true },
    {
      id: "dialect",
      label: "Dialect",
      type: "select",
      options: [...DIALECTS],
      default: "sql",
    },
  ],
  format(input: string, opts: FormatOptions) {
    // Empty / whitespace-only input has no canonical form to compute.
    if (input.trim() === "") return { canonical: "" };

    try {
      return {
        canonical: format(input, {
          language: resolveDialect(opts.dialect),
          keywordCase: opts.uppercaseKeywords === false ? "preserve" : "upper",
        }),
      };
    } catch (e) {
      throw new ParseError(`Invalid SQL: ${(e as Error).message}`);
    }
  },
};
