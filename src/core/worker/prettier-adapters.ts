import type { LanguageAdapter, LanguageId } from "@/modules/engine/lib/types";
import { getAdapter } from "@/modules/engine/lib/registry";
import { makePrettierAdapter, PLUGINS_BY_PARSER } from "@/core/worker/prettier-runtime";

/**
 * WORKER-ONLY adapter wiring.
 *
 * This module is the ONLY place that connects the plain per-language adapters
 * to the heavy formatter runtime. It must be imported exclusively by
 * engine-worker code (`core/worker/diff-runner.ts`, `core/worker/worker.ts`) —
 * never by anything reachable from the main entry — so the formatter stack
 * stays in the worker chunk graph.
 */

const cache = new Map<LanguageId, LanguageAdapter>();

/**
 * Return the worker-flavored adapter for `id`: the plain adapter's metadata,
 * toggles, detect and robust sync `format()`, plus a `formatAsync()` pass
 * (unless `formatterDisabled`) driven by the heavy formatter with the
 * parser-specific plugins looked up from {@link PLUGINS_BY_PARSER}.
 */
export function getWorkerAdapter(id: LanguageId): LanguageAdapter {
  const cached = cache.get(id);
  if (cached) return cached;

  const plain = getAdapter(id);
  const parser = plain.fmtParser;
  if (!parser) {
    // No parser marker (e.g. Plain Text): nothing to attach.
    return plain;
  }

  const wrapped = makePrettierAdapter({
    plain,
    parser,
    plugins: [...(PLUGINS_BY_PARSER[parser] ?? [])],
  });
  cache.set(id, wrapped);
  return wrapped;
}
