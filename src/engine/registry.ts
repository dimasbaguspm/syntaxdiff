import type { LanguageAdapter, LanguageId } from "./types";
import { csvAdapter } from "./adapters/csv";
import { jsonAdapter } from "./adapters/json";
import { plainAdapter } from "./adapters/plain";
import { sqlAdapter } from "./adapters/sql";
import { tomlAdapter } from "./adapters/toml";
import { xmlAdapter } from "./adapters/xml";
import { yamlAdapter } from "./adapters/yaml";

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
