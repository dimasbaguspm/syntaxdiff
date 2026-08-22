import { computeDiffCanonical } from "@/modules/engine/lib/diff";
import { applyOptsDefaults } from "@/modules/engine/lib/diff";
import { getWorkerAdapter } from "@/core/worker/prettier-adapters";
import type { FormatOptions, LanguageAdapter, LanguageId } from "@/modules/engine/lib/types";

export interface DiffRunRequest {
  a: string;
  b: string;
  lang: LanguageId;
  optsA: FormatOptions;
  optsB: FormatOptions;
}

/**
 * Canonicalize one side: run the robust synchronous `format()` (whitespace /
 * parse canonicalize — never throws), then await the async heavy-formatter
 * `formatAsync()` pass when the adapter supports it. On any formatter failure,
 * fall back to the robust canonical text. Shared by the engine worker and the
 * (Node/jsdom) fallback so behaviour is identical off and on the main thread.
 */
export async function canonicalize(
  input: string,
  adapter: LanguageAdapter,
  opts: FormatOptions,
): Promise<string> {
  const base = adapter.format(input, opts).canonical;
  if (adapter.formatAsync) {
    try {
      return (await adapter.formatAsync(input, opts)).canonical;
    } catch {
      return base;
    }
  }
  return base;
}

/**
 * Async diff pipeline. Runs inside the engine Web Worker in the browser —
 * `getWorkerAdapter` wires the heavy formatter pass here, worker-side only.
 */
export async function runDiff(req: DiffRunRequest): Promise<{
  language: LanguageId;
  patch: string;
  counts: { added: number; removed: number };
  lines: ReturnType<typeof computeDiffCanonical>["lines"];
}> {
  const adapter = getWorkerAdapter(req.lang);
  const oA = applyOptsDefaults(adapter, req.optsA);
  const oB = applyOptsDefaults(adapter, req.optsB);
  const [fa, fb] = await Promise.all([
    canonicalize(req.a, adapter, oA),
    canonicalize(req.b, adapter, oB),
  ]);
  return computeDiffCanonical(fa, fb, req.lang);
}
