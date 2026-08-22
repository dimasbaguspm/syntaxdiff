import { describe, expect, it } from "vitest";
import { createDiffClient } from "@/core/worker/client";
import { runDiff } from "@/core/worker/diff-runner";

describe("createDiffClient", () => {
  it("returns an object with diff, format and dispose", () => {
    const client = createDiffClient();
    expect(typeof client.diff).toBe("function");
    expect(typeof client.format).toBe("function");
    expect(typeof client.dispose).toBe("function");
    client.dispose();
  });

  it("falls back to the synchronous engine in jsdom (no Worker)", async () => {
    expect(typeof Worker).toBe("undefined");
    const client = createDiffClient();
    const res = await client.diff({
      a: "a\nb\n",
      b: "a\nc\n",
      lang: "plain",
      opts: {},
    });

    expect(res.language).toBe("plain");
    expect(res.patch).toContain("@@");
    expect(res.counts.added).toBeGreaterThan(0);
    expect(res.counts.removed).toBeGreaterThan(0);
  });

  it("computes a JSON diff through the fallback", async () => {
    const client = createDiffClient();
    const res = await client.diff({
      a: '{"name":"M","age":30}',
      b: '{"name":"M","age":31}',
      lang: "json",
      opts: { sortKeys: true },
    });

    expect(res.language).toBe("json");
    expect(res.counts.added).toBeGreaterThan(0);
    expect(res.counts.removed).toBeGreaterThan(0);
  });

  it("dispose() does not throw on the fallback", async () => {
    const client = createDiffClient();
    await client.diff({ a: "a\n", b: "b\n", lang: "plain", opts: {} });
    expect(() => client.dispose()).not.toThrow();
  });

  it("format() falls back to the robust sync canonicalizer without a Worker", async () => {
    const client = createDiffClient();
    const out = await client.format({
      text: "const x = 1;   \nlet y = 2;\t",
      lang: "js",
      opts: {},
    });
    // Sync baseline only — no heavy formatter on the main thread.
    expect(out).toBe("const x = 1;\nlet y = 2;");
  });

  it("format() surfaces parse failures for invalid data langs", async () => {
    const client = createDiffClient();
    await expect(client.format({ text: "{oops", lang: "json", opts: {} })).rejects.toThrow(
      /Invalid JSON/,
    );
  });
});

describe("runDiff (async formatter pipeline, worker graph)", () => {
  it("offloads canonicalization to the formatter and returns a formatted diff", async () => {
    const res = await runDiff({
      a: "const x=1;function f(){return 2}",
      b: "const y=2;function g(){return 3}",
      lang: "js",
      optsA: {},
      optsB: {},
    });
    expect(res.language).toBe("js");
    // Formatter-applied spacing/semicolons should appear in the canonical text.
    expect(res.patch).toContain("const x = 1;");
    expect(res.patch).toContain("function f() {");
  });

  it("handles a large input without throwing", async () => {
    const big = Array.from({ length: 500 }, (_, i) => `const v${i} = ${i};`).join("\n");
    const res = await runDiff({ a: big, b: big, lang: "js", optsA: {}, optsB: {} });
    expect(res.counts.added + res.counts.removed).toBe(0);
  });

  it("falls back to the robust canonical text when the formatter rejects (invalid syntax)", async () => {
    const res = await runDiff({
      a: "const x = ;;;",
      b: "const x = ;;;",
      lang: "js",
      optsA: {},
      optsB: {},
    });
    // Never throws — falls back to whitespace canonicalization.
    expect(Array.isArray(res.lines)).toBe(true);
    expect(res.counts.added + res.counts.removed).toBe(0);
  });
});
