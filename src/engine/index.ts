export { autoDetect, getAdapter, adapters } from "./registry";
export { applyOptsDefaults, computeDiff } from "./diff";
export { canonicalize } from "./canonical";
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
} from "./types";
