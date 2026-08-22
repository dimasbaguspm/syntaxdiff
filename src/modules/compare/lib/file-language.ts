import type { LanguageId } from "@/modules/engine/lib/types";

/** Map a file extension to a supported language id, or undefined. */
export function languageFromExtension(name: string): LanguageId | undefined {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "json":
    case "json5":
    case "jsonc":
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
    case "html":
    case "htm":
    case "css":
    case "scss":
    case "less":
    case "md":
    case "markdown":
    case "mdx":
    case "vue":
    case "svelte":
    case "astro":
    case "graphql":
    case "gql":
    case "go":
    case "php":
    case "rb":
    case "rs":
    case "kt":
    case "java":
    case "ts":
    case "jsx":
    case "tsx":
    case "sh":
    case "bash":
    case "conf":
      return undefined;
    default:
      return undefined;
  }
}
