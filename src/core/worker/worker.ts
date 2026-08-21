import { computeDiff } from "@/modules/engine/lib";
import type { DiffResult, FormatOptions, LanguageId } from "@/modules/engine/lib/types";
import { createFormatterClient } from "./formatter-client";

export interface DiffRequest {
  id: number;
  a: string;
  b: string;
  lang: LanguageId;
  optsA: FormatOptions;
  optsB: FormatOptions;
}

export type DiffResponse = { id: number; result: DiffResult } | { id: number; error: string };

// Real formatter for JS/TS, offloaded to a dedicated worker for large inputs.
// Created lazily (the nested worker is only built if the environment allows
// it; otherwise `createFormatterClient` falls back to inline formatting).
const formatter = createFormatterClient();

async function preFormat(code: string, lang: LanguageId, opts: FormatOptions): Promise<string> {
  if (lang !== "js" && lang !== "ts") return code;
  if (opts.useFormatter === false) return code;
  const parser = lang === "ts" ? "babel-ts" : "babel";
  const out = await formatter.format(code, parser);
  return out ?? code;
}

self.onmessage = async (e: MessageEvent<DiffRequest>) => {
  const { id, a, b, lang, optsA, optsB } = e.data;
  try {
    const [fa, fb] = await Promise.all([preFormat(a, lang, optsA), preFormat(b, lang, optsB)]);
    const result = computeDiff(fa, fb, lang, optsA, optsB);
    self.postMessage({ id, result } satisfies DiffResponse);
  } catch (err) {
    self.postMessage({ id, error: (err as Error).message } satisfies DiffResponse);
  }
};
