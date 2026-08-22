import { createContext, useContext } from "react";
import type { FormatOptions, LanguageAdapter, LanguageId } from "@/modules/engine/lib/types";
import type { DiffStatus, LangChoice } from "@/core/store";
import type { PaneStatus } from "@/modules/compare/hooks/use-pane-status";

export type Side = "a" | "b";

/** Presentational contract for one source pane, derived from store state. */
export interface PaneViewModel {
  side: Side;
  label: string;
  value: string;
  status: PaneStatus;
  icon: LanguageId;
  onLabelChange: (v: string) => void;
  onChange: (v: string) => void;
  onImportFile: (file: File, method: "drop" | "button") => void;
}

export interface CompareContextValue {
  adapter: LanguageAdapter;
  lang: LangChoice;
  status: DiffStatus;
  optionsOpen: boolean;
  adapters: LanguageAdapter[];
  getPane: (side: Side) => PaneViewModel;
  setLang: (lang: LangChoice) => void;
  openOptions: () => void;
  closeOptions: () => void;
  compare: () => void;
  validateSide: (side: Side) => void;
  formatSide: (side: Side) => void;
  /** True while a pane is being formatted / validated (async spinner). */
  formatting: Record<Side, boolean>;
  validating: Record<Side, boolean>;
}

export const CompareContext = createContext<CompareContextValue | null>(null);

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within <CompareProvider>");
  return ctx;
}

export type { FormatOptions };
