import { describe, expect, it } from "vitest";
import { computeDiff } from "../diff";

describe("computeDiff", () => {
  it("key reorder with sortKeys is a zero-change structural diff", () => {
    const a = '{"name":"M","age":30,"roles":["a","b"]}';
    const b = '{"roles":["a","b"],"age":30,"name":"M"}';
    const r = computeDiff(a, b, "json", { sortKeys: true }, { sortKeys: true });
    expect(r.language).toBe("json");
    expect(r.counts.added).toBe(0);
    expect(r.counts.removed).toBe(0);
  });

  it("reports real value changes", () => {
    const a = '{"name":"M","age":30}';
    const b = '{"name":"M","age":31}';
    const r = computeDiff(a, b, "json", { sortKeys: true }, { sortKeys: true });
    expect(r.counts.added).toBeGreaterThan(0);
    expect(r.counts.removed).toBeGreaterThan(0);
  });

  it("array order change IS a diff (arrays are ordered)", () => {
    const a = '{"roles":["a","b"]}';
    const b = '{"roles":["b","a"]}';
    const r = computeDiff(a, b, "json", { sortKeys: true }, { sortKeys: true });
    expect(r.counts.added + r.counts.removed).toBeGreaterThan(0);
  });

  it("produces a unified patch for diff2html", () => {
    const r = computeDiff("a\nb\n", "a\nc\n", "plain", {}, {});
    expect(r.patch).toContain("@@");
  });

  it("uses identical file names so diff2html does not report a rename", () => {
    const r = computeDiff("a\nb\n", "a\nc\n", "plain", {}, {});
    expect(r.patch).toContain("--- diff");
    expect(r.patch).toContain("+++ diff");
    expect(r.patch).not.toMatch(/similarity index|rename from|rename to/);
  });
});
