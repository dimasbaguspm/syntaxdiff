import { computeDiff } from "@/modules/engine/lib";
import { getAdapter } from "@/modules/engine/lib/registry";
import type { DiffResult, FormatOptions, LanguageId } from "@/modules/engine/lib/types";
import type {
  DiffRequest,
  FormatRequest,
  FormatResponse,
  WorkerResponse,
} from "@/core/worker/worker";

export interface DiffClient {
  diff(req: { a: string; b: string; lang: LanguageId; opts: FormatOptions }): Promise<DiffResult>;
  /** Offload canonicalization to the engine worker (heavy formatter included). */
  format(req: { text: string; lang: LanguageId; opts: FormatOptions }): Promise<string>;
  dispose(): void;
}

/**
 * Promise-based wrapper around the engine worker. The engine (and its heavy
 * formatting stack) stays off the main thread so large payloads never freeze
 * the UI.
 *
 * Falls back to running the robust synchronous engine inline when Web Workers
 * are unavailable — e.g. in jsdom/happy-dom tests. The fallback never imports
 * the worker-only formatter runtime; it degrades to the sync `format()`.
 */
export function createDiffClient(): DiffClient {
  let worker: Worker | null = null;
  try {
    worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  } catch {
    worker = null;
  }

  if (worker) {
    const pendingDiff = new Map<
      number,
      { resolve: (r: DiffResult) => void; reject: (e: Error) => void }
    >();
    const pendingFormat = new Map<
      number,
      { resolve: (t: string) => void; reject: (e: Error) => void }
    >();
    let nextId = 1;

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const data = e.data;
      if (data.kind === "format") {
        const p = pendingFormat.get(data.id);
        if (!p) return;
        pendingFormat.delete(data.id);
        if ("error" in data) p.reject(new Error(data.error));
        else p.resolve((data as FormatResponse).text);
        return;
      }
      const p = pendingDiff.get(data.id);
      if (!p) return;
      pendingDiff.delete(data.id);
      if ("error" in data) p.reject(new Error(data.error));
      else p.resolve(data.result);
    };

    worker.onerror = (e) => {
      for (const [, p] of pendingDiff) p.reject(new Error(`Worker error: ${e.message}`));
      for (const [, p] of pendingFormat) p.reject(new Error(`Worker error: ${e.message}`));
      pendingDiff.clear();
      pendingFormat.clear();
    };

    return {
      diff(req) {
        const id = nextId++;
        const msg: DiffRequest = { id, kind: "diff", ...req, optsA: req.opts, optsB: req.opts };
        return new Promise((resolve, reject) => {
          pendingDiff.set(id, { resolve, reject });
          worker!.postMessage(msg);
        });
      },
      format(req) {
        const id = nextId++;
        const msg: FormatRequest = { id, kind: "format", ...req };
        return new Promise((resolve, reject) => {
          pendingFormat.set(id, { resolve, reject });
          worker!.postMessage(msg);
        });
      },
      dispose() {
        worker?.terminate();
        pendingDiff.clear();
        pendingFormat.clear();
      },
    };
  }

  // Fallback: no Worker — run the robust synchronous engine on the main
  // thread. No heavy formatter here: plain adapters only (sync canonicalize).
  return {
    async diff(req) {
      return computeDiff(req.a, req.b, req.lang, req.opts, req.opts);
    },
    async format(req) {
      return getAdapter(req.lang).format(req.text, req.opts).canonical;
    },
    dispose() {},
  };
}
