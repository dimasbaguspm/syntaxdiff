import { create } from "zustand";
import type { DiffResult, FormatOptions, LanguageId } from "./engine";

export type DiffStatus = "idle" | "running" | "done" | "error";
export type ViewMode = "split" | "unified";
export type LangChoice = LanguageId | "auto";
export type SnackType = "info" | "success" | "error";

export interface Snack {
  id: number;
  message: string;
  type: SnackType;
}

let snackSeq = 0;

const RESET = { status: "idle" as const, result: null };

interface AppState {
  a: string;
  b: string;
  labelA: string;
  labelB: string;
  lang: LangChoice;
  opts: FormatOptions;
  mode: ViewMode;
  status: DiffStatus;
  result: DiffResult | null;
  snack: Snack | null;
  setA(v: string): void;
  setB(v: string): void;
  setLabelA(v: string): void;
  setLabelB(v: string): void;
  setLang(l: LangChoice): void;
  setOpt(id: string, val: boolean | string): void;
  setMode(m: ViewMode): void;
  runStart(): void;
  runSuccess(r: DiffResult): void;
  runError(message: string): void;
  showSnack(message: string, type?: SnackType): void;
  dismissSnack(): void;
}

export const useStore = create<AppState>((set) => ({
  a: "",
  b: "",
  labelA: "Source A",
  labelB: "Source B",
  lang: "auto",
  opts: {},
  mode: "split",
  status: "idle",
  result: null,
  snack: null,
  setA: (v) => set({ a: v, ...RESET }),
  setB: (v) => set({ b: v, ...RESET }),
  setLabelA: (v) => set({ labelA: v }),
  setLabelB: (v) => set({ labelB: v }),
  setLang: (l) => set({ lang: l, ...RESET }),
  setOpt: (id, val) => set((s) => ({ opts: { ...s.opts, [id]: val }, ...RESET })),
  setMode: (m) => set({ mode: m }),
  runStart: () => set({ status: "running", snack: null }),
  runSuccess: (r) => set({ status: "done", result: r, snack: null }),
  runError: (message) =>
    set({ status: "error", snack: { id: ++snackSeq, message, type: "error" } }),
  showSnack: (message, type = "info") => set({ snack: { id: ++snackSeq, message, type } }),
  dismissSnack: () => set({ snack: null }),
}));
