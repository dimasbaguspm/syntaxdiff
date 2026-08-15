import type { DiffResult, FormatOptions, LanguageId } from "../engine/types";
import type { DiffRequest, DiffResponse } from "./worker";

export interface DiffClient {
  diff(req: { a: string; b: string; lang: LanguageId; opts: FormatOptions }): Promise<DiffResult>;
  dispose(): void;
}

/**
 * Promise-based wrapper around the engine worker. The engine stays off the
 * main thread so large payloads never freeze the UI.
 */
export function createDiffClient(): DiffClient {
  const worker = new Worker(new URL("./worker.ts", import.meta.url), {
    type: "module",
  });
  const pending = new Map<
    number,
    { resolve: (r: DiffResult) => void; reject: (e: Error) => void }
  >();
  let nextId = 1;

  worker.onmessage = (e: MessageEvent<DiffResponse>) => {
    const data = e.data;
    const p = pending.get(data.id);
    if (!p) return;
    pending.delete(data.id);
    if ("error" in data) p.reject(new Error(data.error));
    else p.resolve(data.result);
  };

  worker.onerror = (e) => {
    for (const [, p] of pending) p.reject(new Error(`Worker error: ${e.message}`));
    pending.clear();
  };

  return {
    diff(req) {
      const id = nextId++;
      const msg: DiffRequest = { ...req, id, optsA: req.opts, optsB: req.opts };
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        worker.postMessage(msg);
      });
    },
    dispose() {
      worker.terminate();
      pending.clear();
    },
  };
}
