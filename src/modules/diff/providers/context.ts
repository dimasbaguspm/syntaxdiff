import { createContext, useContext } from "react";
import type { DiffRecord } from "@/core/db";

export interface DiffContextValue {
  /** undefined = loading, null = not found, otherwise the saved record. */
  rec: DiffRecord | null | undefined;
}

export const DiffContext = createContext<DiffContextValue | null>(null);

export function useDiff(): DiffContextValue {
  const ctx = useContext(DiffContext);
  if (!ctx) throw new Error("useDiff must be used within <DiffProvider>");
  return ctx;
}
