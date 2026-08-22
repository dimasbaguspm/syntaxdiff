import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { ParseError } from "@/modules/engine/lib/types";
import type { FormatOptions, FormatResult, LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles } from "./code-format";
import { tryParse } from "./shared-detect";

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
  if (!t.startsWith("<")) return 0;
  // Confident when the markup actually parses as XML; partial/garbled markup
  // still surfaces at low confidence so the user can force-format it.
  return tryParse(input, (s) => parser.parse(s)) !== undefined ? 1 : 0.3;
}

/** Plain metadata + robust sync canonicalization; the XML plugin wiring lives
 *  worker-side only (see `src/core/worker`). */
export const xmlAdapter: LanguageAdapter = {
  id: "xml",
  label: "XML",
  fmtParser: "xml",
  fmtOptions: { tabWidth: 2, printWidth: 80 },
  detect: detectXml,
  toggles: markupFmtToggles,
  format: xmlCanonical,
};

export { parser as parseXml };
