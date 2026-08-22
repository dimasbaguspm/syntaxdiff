/**
 * Minimal *global* shims the formatter plugins expect inside a browser Web
 * Worker, where Node's globals are absent.
 *
 * The stub module (`node-builtins-stub.ts`) covers bare *imports*
 * (`import fs from "fs"`, `import { types } from "node:util"`, …). This module
 * covers the `process` **global**, which the plugins reference directly (e.g.
 * `@prettier/plugin-php` calls `process.cwd()` to locate a `composer.json`).
 *
 * Vite externalizes `process` to `globalThis.process` in the worker bundle and
 * does not define it, so in the browser it is `undefined` and
 * `process.cwd()` would throw. We install a deterministic stub *before* any
 * plugin is dynamically imported. `worker.ts` imports and runs this once at the
 * top of the worker module graph.
 */

export interface MinimalProcess {
  cwd: () => string;
  env: Record<string, string | undefined>;
  platform: string;
  arch: string;
  versions: Record<string, string>;
  argv: string[];
  type: string;
  nextTick: (fn: (...args: unknown[]) => void, ...args: unknown[]) => void;
  [key: string]: unknown;
}

/** A `process` shim with just the surface the formatter stack touches. */
export function createStubProcess(): MinimalProcess {
  const noop = () => undefined;
  return new Proxy(
    {
      cwd: () => "/",
      env: {} as Record<string, string | undefined>,
      platform: "linux",
      arch: "x64",
      // Prettier's bundled `@nodelib/fs.scandir` runs
      // `process.versions.node.split(".")` at module load — an empty object
      // here crashes the whole dynamic import (identity fallback).
      versions: { node: "22.0.0" } as Record<string, string>,
      argv: [] as string[],
      type: "worker",
      nextTick: (fn: (...args: unknown[]) => void, ...args: unknown[]) => {
        void Promise.resolve().then(() => fn(...args));
      },
    },
    {
      get: (target, prop: string) =>
        prop in target ? (target as Record<string, unknown>)[prop] : noop,
    },
  ) as MinimalProcess;
}

/**
 * Install the global `process` shim if it is missing. Idempotent: if a real
 * `process` already exists (Node/jsdom/happy-dom tests) it is left untouched.
 */
export function installWebWorkerShims(): void {
  const g = globalThis as unknown as { process?: MinimalProcess };
  if (typeof g.process === "undefined" || g.process === null) {
    g.process = createStubProcess();
  }
}
