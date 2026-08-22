import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { ParseError } from "@/modules/engine/lib/types";
import type { FormatOptions, FormatResult, LanguageAdapter } from "@/modules/engine/lib/types";
import { makePrettierAdapter, markupPrettierToggles } from "./code-format";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

/** Parse + re-serialize WITHOUT key/attr-sort (order preserved). Throws on
 *  invalid XML. */
function xmlCanonical(input: string, _opts: FormatOptions): FormatResult {
  let obj: unknown;
  try {
    obj = parser.parse(input);
  } catch (e) {
    throw new ParseError(`Invalid XML: ${(e as Error).message}`);
  }
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    format: true,
  });
  return { canonical: builder.build(obj) };
}

function detectXml(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (t.startsWith("<")) return 1;
  return 0;
}

export const xmlAdapter: LanguageAdapter = makePrettierAdapter({
  id: "xml",
  label: "XML",
  parser: "xml",
  plugins: ["@prettier/plugin-xml"],
  prettierOptions: { tabWidth: 2, printWidth: 80 },
  robust: xmlCanonical,
  toggles: markupPrettierToggles,
  detect: detectXml,
});

export { parser as parseXml };
