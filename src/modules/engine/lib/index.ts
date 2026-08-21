export { autoDetect, getAdapter, adapters } from "@/modules/engine/lib/registry";
export { applyOptsDefaults, computeDiff } from "@/modules/engine/lib/diff";
export { canonicalize } from "@/modules/engine/lib/canonical";
export type {
  DiffCounts,
  DiffLine,
  DiffResult,
  FormatOptions,
  FormatResult,
  LanguageAdapter,
  LanguageId,
  ParseError,
  ToggleDef,
} from "@/modules/engine/lib/types";
