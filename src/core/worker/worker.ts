import { canonicalize, runDiff } from "@/core/worker/diff-runner";
import { getWorkerAdapter } from "@/core/worker/prettier-adapters";
import type { DiffResult, FormatOptions, LanguageId } from "@/modules/engine/lib/types";

export interface DiffRequest {
  id: number;
  kind: "diff";
  a: string;
  b: string;
  lang: LanguageId;
  optsA: FormatOptions;
  optsB: FormatOptions;
}

export interface FormatRequest {
  id: number;
  kind: "format";
  text: string;
  lang: LanguageId;
  opts: FormatOptions;
}

export type WorkerRequest = DiffRequest | FormatRequest;

export interface FormatResponse {
  id: number;
  kind: "format";
  text: string;
}

export type WorkerResponse =
  | { id: number; kind: "diff"; result: DiffResult }
  | { id: number; kind: "diff"; error: string }
  | FormatResponse
  | { id: number; kind: "format"; error: string };

// The engine worker offloads the (async, heavy-formatter) canonicalization off
// the main thread. The formatter runtime lives entirely in this worker graph —
// the main entry never imports it (see `prettier-runtime.ts` /
// `prettier-adapters.ts`).
self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const msg = e.data;
  try {
    if (msg.kind === "format") {
      const adapter = getWorkerAdapter(msg.lang);
      const text = await canonicalize(msg.text, adapter, msg.opts);
      self.postMessage({ id: msg.id, kind: "format", text } satisfies FormatResponse);
      return;
    }
    const result = await runDiff({
      a: msg.a,
      b: msg.b,
      lang: msg.lang,
      optsA: msg.optsA,
      optsB: msg.optsB,
    });
    self.postMessage({ id: msg.id, kind: "diff", result } satisfies WorkerResponse);
  } catch (err) {
    const message = (err as Error).message ?? String(err);
    const response: WorkerResponse =
      msg.kind === "format"
        ? { id: msg.id, kind: "format", error: message }
        : { id: msg.id, kind: "diff", error: message };
    self.postMessage(response);
  }
};
