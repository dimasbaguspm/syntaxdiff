import type { LanguageId } from "@/modules/engine/lib/types";

/** Map a file extension to a supported language id, or undefined. */
export function languageFromExtension(name: string): LanguageId | undefined {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "json":
      return "json";
    case "yaml":
    case "yml":
      return "yaml";
    case "sql":
      return "sql";
    case "csv":
      return "csv";
    case "toml":
      return "toml";
    case "xml":
      return "xml";
    default:
      return undefined;
  }
}
