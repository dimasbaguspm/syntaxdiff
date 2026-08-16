import { describe, expect, it } from "vitest";
import { createDiffClient } from "./client";

describe("createDiffClient", () => {
  it("returns an object with diff and dispose", () => {
    const client = createDiffClient();
    expect(typeof client.diff).toBe("function");
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
});
