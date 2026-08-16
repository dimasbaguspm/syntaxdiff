import { format, type SqlLanguage } from "sql-formatter";
import { ParseError } from "../types";
import type { FormatOptions, LanguageAdapter } from "../types";

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
    try {
      return {
        canonical: format(input, {
          language: (opts.dialect as SqlLanguage) || "sql",
          keywordCase: opts.uppercaseKeywords === false ? "preserve" : "upper",
        }),
      };
    } catch (e) {
      throw new ParseError(`Invalid SQL: ${(e as Error).message}`);
    }
  },
};
