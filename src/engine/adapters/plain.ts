import type { FormatOptions, LanguageAdapter } from "../types";

/** Fallback for anything the heuristics can't classify. */
export const plainAdapter: LanguageAdapter = {
  id: "plain",
  label: "Plain Text",
  detect(): number {
    return 0;
  },
  toggles: [
    { id: "ignoreCase", label: "Ignore case" },
    { id: "ignoreWhitespace", label: "Ignore whitespace" },
  ],
  format(input: string, opts: FormatOptions) {
    let canonical = input;
    if (opts.ignoreCase) canonical = canonical.toLowerCase();
    if (opts.ignoreWhitespace) canonical = canonical.replace(/\s+/g, "").trim();
    return { canonical };
  },
};
