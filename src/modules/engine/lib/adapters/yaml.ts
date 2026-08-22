import { dump, load } from "js-yaml";
import { ParseError } from "@/modules/engine/lib/types";
import type { FormatOptions, FormatResult, LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles } from "./code-format";
import { tryParse, YAML_DOC_MARKER, YAML_LIST, YAML_MAPPING } from "./shared-detect";

/** Parse + re-serialize WITHOUT key-sort (key order preserved). Throws on
 *  invalid YAML. */
function yamlCanonical(input: string, _opts: FormatOptions): FormatResult {
  let v: unknown;
  try {
    v = load(input);
  } catch (e) {
    throw new ParseError(`Invalid YAML: ${(e as Error).message}`);
  }
  return { canonical: dump(v, { lineWidth: -1 }) };
}

function detectYaml(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  // Mapping `key:` or list `- ` (or leading --- document marker)
  if (
    YAML_DOC_MARKER.test(t.split("\n")[0] ?? "") ||
    YAML_MAPPING.test(input) ||
    YAML_LIST.test(input)
  ) {
    if (tryParse(input, load) !== undefined) return 1;
    return 0.3;
  }
  return 0;
}

export const yamlAdapter: LanguageAdapter = {
  id: "yaml",
  label: "YAML",
  fmtParser: "yaml",
  fmtOptions: { tabWidth: 2, printWidth: 80 },
  detect: detectYaml,
  toggles: markupFmtToggles,
  format: yamlCanonical,
};

export { load as parseYaml };
