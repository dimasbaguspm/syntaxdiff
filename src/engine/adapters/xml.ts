import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { ParseError } from "../types";
import type { FormatOptions, LanguageAdapter } from "../types";
import { canonicalize } from "../canonical";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

export const xmlAdapter: LanguageAdapter = {
  id: "xml",
  label: "XML",
  detect(input: string): number {
    const t = input.trimStart();
    if (!t) return 0;
    if (t.startsWith("<")) return 1;
    return 0;
  },
  toggles: [{ id: "sortKeys", label: "Alphabetize elements/attrs (recursive)" }],
  format(input: string, opts: FormatOptions) {
    let obj: unknown;
    try {
      obj = parser.parse(input);
    } catch (e) {
      throw new ParseError(`Invalid XML: ${(e as Error).message}`);
    }
    const canonical = canonicalize(obj, opts.sortKeys === true);
    const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    return { canonical: builder.build(canonical) };
  },
};
