import { create } from "zustand";
import type { DiffResult, FormatOptions, LanguageId } from "./engine";

export type DiffStatus = "idle" | "running" | "done" | "error";
export type ViewMode = "split" | "unified";
export type LangChoice = LanguageId | "auto";

interface AppState {
  a: string;
  b: string;
  lang: LangChoice;
  opts: FormatOptions;
  mode: ViewMode;
  status: DiffStatus;
  result: DiffResult | null;
  error: string | null;
  setA(v: string): void;
  setB(v: string): void;
  setLang(l: LangChoice): void;
  setOpt(id: string, val: boolean): void;
  setMode(m: ViewMode): void;
  runStart(): void;
  runSuccess(r: DiffResult): void;
  runError(message: string): void;
}

export const useStore = create<AppState>((set) => ({
  a: "",
  b: "",
  lang: "auto",
  opts: {},
  mode: "split",
  status: "idle",
  result: null,
  error: null,
  setA: (v) => set({ a: v, status: "idle", result: null, error: null }),
  setB: (v) => set({ b: v, status: "idle", result: null, error: null }),
  setLang: (l) => set({ lang: l, status: "idle", result: null, error: null }),
  setOpt: (id, val) =>
    set((s) => ({ opts: { ...s.opts, [id]: val }, status: "idle", result: null, error: null })),
  setMode: (m) => set({ mode: m }),
  runStart: () => set({ status: "running", error: null }),
  runSuccess: (r) => set({ status: "done", result: r, error: null }),
  runError: (message) => set({ status: "error", error: message }),
}));
