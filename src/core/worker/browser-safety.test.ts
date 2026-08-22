/**
 * Browser-safety proof for the two formatter plugins that touch Node builtins.
 *
 * The engine worker bundles @prettier/plugin-php and @prettier/plugin-pug. In
 * the browser/worker these specifiers are externalized, so the plugins must
 * tolerate their absence. `vitest.config.ts` aliases every Node builtin to
 * `node-builtins-stub.ts` (mirroring the production externalization) and
 * `@prettier/plugin-php` to its clean ESM entry. This test runs the REAL
 * pipeline — `getWorkerAdapter()` -> `formatAsync()` ->
 * `prettier.format()` -> dynamic plugin import — with `process` replaced by the
 * same minimal shim the worker installs, and asserts Prettier actually ran
 * (i.e. the robust whitespace fallback was NOT used).
 */
import { describe, expect, it } from "vitest";
import { getWorkerAdapter } from "./prettier-adapters";
import { createStubProcess, installWebWorkerShims } from "./web-worker-shims";
import { phpAdapter } from "@/modules/engine/lib/adapters/php";
import { pugAdapter } from "@/modules/engine/lib/adapters/pug";

/**
 * Run `fn` with `globalThis.process` replaced by the worker's minimal shim,
 * mirroring the browser worker where Node's `process` is undefined and
 * `worker.ts` installs the stub before importing any plugin. Restored
 * immediately after so vitest's own process stays intact.
 */
async function withBrowserProcess<T>(fn: () => Promise<T>): Promise<T> {
  const saved = globalThis.process;
  (globalThis as { process?: unknown }).process = createStubProcess();
  try {
    return await fn();
  } finally {
    globalThis.process = saved;
  }
}

describe("engine worker: PHP formatting with Node builtins absent", () => {
  const input = "<?php function f(){return 1;}";

  it("formats via Prettier (not the whitespace fallback)", async () => {
    const fallback = phpAdapter.format(input, {}).canonical;
    const out = await withBrowserProcess(() => getWorkerAdapter("php").formatAsync!(input, {}));
    // Prettier re-flows the signature onto multiple indented lines; the
    // whitespace canonicalizer leaves it on one line. Different output proves
    // the heavy formatter actually executed. Indent follows the adapter's
    // fmtOptions (tabWidth: 2).
    expect(out.canonical).not.toBe(fallback);
    expect(out.canonical).toContain("function f()\n{");
    expect(out.canonical).toContain("  return 1;");
    expect(out.canonical.trimEnd()).toBe("<?php function f()\n{\n  return 1;\n}");
  });

  it("does not throw on invalid PHP (falls back gracefully)", async () => {
    const out = await withBrowserProcess(() =>
      getWorkerAdapter("php").formatAsync!("<?php this is @@@ not valid", {}),
    );
    expect(typeof out.canonical).toBe("string");
    expect(out.canonical.length).toBeGreaterThan(0);
  });
});

describe("engine worker: PUG formatting with Node builtins absent", () => {
  const input = "div\n if x\n  p y";

  it("formats via Prettier (not the whitespace fallback)", async () => {
    const fallback = pugAdapter.format(input, {}).canonical;
    const out = await withBrowserProcess(() => getWorkerAdapter("pug").formatAsync!(input, {}));
    // Prettier re-indents `p y` under `if x`; the whitespace canonicalizer
    // preserves the raw two-space indentation. The 4-space reindent proves the
    // heavy formatter executed.
    expect(out.canonical).not.toBe(fallback);
    expect(out.canonical).toContain("    p y");
    expect(out.canonical.trimEnd()).toBe("div\n  if x\n    p y");
  });
});

describe("worker global shim (process)", () => {
  it("installs a minimal process when absent and is idempotent", () => {
    const saved = globalThis.process;
    (globalThis as { process?: unknown }).process = undefined;
    try {
      installWebWorkerShims();
      const p = globalThis.process as unknown as { cwd: () => string };
      expect(typeof p.cwd).toBe("function");
      expect(p.cwd()).toBe("/");
      // Re-running must not replace an already-installed shim.
      const first = globalThis.process;
      installWebWorkerShims();
      expect(globalThis.process).toBe(first);
    } finally {
      globalThis.process = saved;
    }
  });

  it("leaves an existing real process untouched", () => {
    const before = globalThis.process;
    installWebWorkerShims();
    expect(globalThis.process).toBe(before);
  });
});
