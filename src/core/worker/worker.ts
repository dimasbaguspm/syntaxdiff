import { runDiff } from "@/core/worker/diff-runner";
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

// The engine worker offloads the (async, Prettier-based) canonicalization off
// the main thread. Prettier is dynamically imported only inside `formatAsync`,
// so it never bloats the cold-start of the synchronous `format()` path and is
// code-split into lazy chunks.
self.onmessage = async (e: MessageEvent<DiffRequest>) => {
  const { id, a, b, lang, optsA, optsB } = e.data;
  try {
    const result = await runDiff({ a, b, lang, optsA, optsB });
    self.postMessage({ id, result } satisfies DiffResponse);
  } catch (err) {
    self.postMessage({
      id,
      error: (err as Error).message ?? String(err),
    } satisfies DiffResponse);
  }
};
