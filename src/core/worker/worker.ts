import { computeDiff } from "@/modules/engine/lib";
import type { DiffResult, FormatOptions, LanguageId } from "@/modules/engine/lib/types";

export interface DiffRequest {
  id: number;
  a: string;
  b: string;
  lang: LanguageId;
  optsA: FormatOptions;
  optsB: FormatOptions;
}

export type DiffResponse = { id: number; result: DiffResult } | { id: number; error: string };

self.onmessage = (e: MessageEvent<DiffRequest>) => {
  const { id, a, b, lang, optsA, optsB } = e.data;
  try {
    const result = computeDiff(a, b, lang, optsA, optsB);
    self.postMessage({ id, result } satisfies DiffResponse);
  } catch (err) {
    self.postMessage({ id, error: (err as Error).message } satisfies DiffResponse);
  }
};
