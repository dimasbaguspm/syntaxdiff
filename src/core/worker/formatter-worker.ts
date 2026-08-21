/// <reference lib="webworker" />
import type { FormatParser, FormatRequest, FormatResponse } from "./formatter-client";

// Dedicated Prettier worker. Offloads the (heavy-ish) Prettier parse/print from
// the engine worker / main thread for large code inputs. Kept Worker-only: it
// must not be imported by the synchronous engine pipeline.

let prettierMod: typeof import("prettier") | null = null;

async function getPrettier(): Promise<typeof import("prettier")> {
  if (!prettierMod) prettierMod = await import("prettier");
  return prettierMod;
}

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async (e: MessageEvent<FormatRequest>) => {
  const { id, code, parser } = e.data;
  try {
    const prettier = await getPrettier();
    const formatted = await prettier.format(code, {
      parser: parser as FormatParser,
      semi: true,
      singleQuote: false,
      printWidth: 80,
      tabWidth: 2,
    });
    ctx.postMessage({ id, formatted } satisfies FormatResponse);
  } catch {
    // Invalid syntax or Prettier unavailable — let the caller fall back.
    ctx.postMessage({ id, error: "format-failed" } satisfies FormatResponse);
  }
};
