import type { LanguageAdapter, LanguageId } from "@/modules/engine/lib/types";
import { csvAdapter } from "@/modules/engine/lib/adapters/csv";
import { jsonAdapter } from "@/modules/engine/lib/adapters/json";
import { plainAdapter } from "@/modules/engine/lib/adapters/plain";
import { sqlAdapter } from "@/modules/engine/lib/adapters/sql";
import { tomlAdapter } from "@/modules/engine/lib/adapters/toml";
import { xmlAdapter } from "@/modules/engine/lib/adapters/xml";
import { yamlAdapter } from "@/modules/engine/lib/adapters/yaml";

export const adapters: LanguageAdapter[] = [
  jsonAdapter,
  yamlAdapter,
  sqlAdapter,
  csvAdapter,
  tomlAdapter,
  xmlAdapter,
  plainAdapter,
];

export function getAdapter(id: LanguageId): LanguageAdapter {
  const adapter = adapters.find((a) => a.id === id);
  if (!adapter) throw new Error(`Unknown language: ${id}`);
  return adapter;
}

/** Pick the best language by heuristic confidence; falls back to Plain Text. */
export function autoDetect(input: string): LanguageAdapter {
  let best = plainAdapter;
  let bestScore = 0;
  for (const adapter of adapters) {
    if (adapter.id === "plain") continue;
    const score = adapter.detect(input);
    if (score > bestScore) {
      bestScore = score;
      best = adapter;
    }
  }
  return best;
}
