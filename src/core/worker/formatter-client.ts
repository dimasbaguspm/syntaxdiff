import {
  FORMATTER_LINE_THRESHOLD,
  type PrettierParser,
} from "@/modules/engine/lib/adapters/code-format";

export type FormatParser = PrettierParser;

export interface FormatRequest {
  id: number;
  code: string;
  parser: FormatParser;
}

export type FormatResponse = { id: number; formatted: string } | { id: number; error: string };

export interface FormatterClient {
  /** Format `code` with Prettier. Large inputs go to a dedicated worker; small
   *  inputs run inline. Resolves to the formatted text, or `null` if Prettier
   *  rejected (e.g. invalid syntax) so callers can fall back. Never rejects. */
  format(code: string, parser: FormatParser): Promise<string | null>;
  dispose(): void;
}

/**
 * Promise-based wrapper around a dedicated Prettier formatter worker.
 *
 * Routing: inputs longer than `FORMATTER_LINE_THRESHOLD` lines are posted to a
 * nested Web Worker (off the engine/main thread); smaller inputs are formatted
 * inline via a dynamic `import("prettier")` on the calling thread to avoid the
 * worker round-trip overhead.
 *
 * Falls back to inline formatting when Web Workers are unavailable (e.g. jsdom
 * / some test environments) and to `null` when Prettier errors, so callers can
 * always safely fall back to the robust whitespace canonicalizer.
 */
export function createFormatterClient(lineThreshold = FORMATTER_LINE_THRESHOLD): FormatterClient {
  let worker: Worker | null = null;
  try {
    worker = new Worker(new URL("./formatter-worker.ts", import.meta.url), { type: "module" });
  } catch {
    worker = null;
  }

  const pending = new Map<number, { resolve: (s: string | null) => void }>();
  let nextId = 1;

  if (worker) {
    worker.onmessage = (e: MessageEvent<FormatResponse>) => {
      const data = e.data;
      const p = pending.get(data.id);
      if (!p) return;
      pending.delete(data.id);
      if ("error" in data) p.resolve(null);
      else p.resolve(data.formatted);
    };
    worker.onerror = () => {
      for (const [, p] of pending) p.resolve(null);
      pending.clear();
    };
  }

  async function formatInline(code: string, parser: FormatParser): Promise<string | null> {
    try {
      const prettier = await import("prettier");
      return await prettier.format(code, {
        parser,
        semi: true,
        singleQuote: false,
        printWidth: 80,
        tabWidth: 2,
      });
    } catch {
      return null;
    }
  }

  return {
    format(code: string, parser: FormatParser): Promise<string | null> {
      const lines = code.split("\n").length;
      if (worker && lines > lineThreshold) {
        const id = nextId++;
        return new Promise<string | null>((resolve) => {
          pending.set(id, { resolve });
          worker!.postMessage({ id, code, parser } satisfies FormatRequest);
        });
      }
      return formatInline(code, parser);
    },
    dispose() {
      worker?.terminate();
      pending.clear();
    },
  };
}
