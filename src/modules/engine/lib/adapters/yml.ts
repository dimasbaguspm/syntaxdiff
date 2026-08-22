import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { yamlAdapter } from "./yaml";

/** `.yml` is the same YAML language; reuse the YAML adapter. */
export const ymlAdapter: LanguageAdapter = { ...yamlAdapter, id: "yml", label: "YAML" };
