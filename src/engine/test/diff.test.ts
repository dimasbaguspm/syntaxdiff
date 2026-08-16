import { describe, expect, it } from "vitest";
import { computeDiff } from "../diff";
import { getAdapter } from "../registry";

describe("computeDiff", () => {
  it("key reorder with sortKeys is a zero-change structural diff", () => {
    const a = '{"name":"M","age":30,"roles":["a","b"]}';
    const b = '{"roles":["a","b"],"age":30,"name":"M"}';
    const r = computeDiff(a, b, "json", { sortKeys: true }, { sortKeys: true });
    expect(r.language).toBe("json");
    expect(r.counts.added).toBe(0);
    expect(r.counts.removed).toBe(0);
  });

  it("applies adapter defaults so key reorder is a zero-change diff by default", () => {
    const a = '{"name":"M","age":30}';
    const b = '{"age":30,"name":"M"}'; // reordered keys, same structure
    const r = computeDiff(a, b, "json", {}, {});
    expect(r.counts.added + r.counts.removed).toBe(0);
  });

  it("applies defaults so TOML key reorder is a zero-change diff by default", () => {
    const a = `[database]\nserver = "192.168.1.1"\nports = [8000, 8001, 8002]\nconnection_max = 5000\n`;
    const b = `[database]\nconnection_max = 5000\nports = [8000, 8001, 8002]\nserver = "192.168.1.1"\n`;
    const r = computeDiff(a, b, "toml", {}, {});
    expect(r.counts.added + r.counts.removed).toBe(0);
  });

  it("reports only inline TOML changes, not whole-block noise", () => {
    const a = `[database]\nserver = "192.168.1.1"\nports = [8000, 8001, 8002]\nconnection_max = 5000\n`;
    const b = `[database]\nserver = "10.0.0.5"\nports = [8000, 8001, 8002, 8003]\nconnection_max = 5000\n`;
    const r = computeDiff(a, b, "toml", {}, {});
    expect(r.counts.added).toBeLessThan(3);
    expect(r.counts.removed).toBeLessThan(3);
  });

  it("YAML canonical output is deterministic (long single-line string not folded)", () => {
    const long = `description: "${"x ".repeat(80)}y"\n`;
    const r = computeDiff(long, long, "yaml", {}, {});
    expect(r.counts.added + r.counts.removed).toBe(0);
    // same doc canonicalizes to identical output (no width-dependent folding)
    const a = getAdapter("yaml").format(long, {}).canonical;
    const b = getAdapter("yaml").format(long, {}).canonical;
    expect(a).toBe(b);
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

  it("produces a unified patch for export", () => {
    const r = computeDiff("a\nb\n", "a\nc\n", "plain", {}, {});
    expect(r.patch).toContain("@@");
  });

  it("produces structured line rows for rendering", () => {
    const r = computeDiff("a\nb\n", "a\nc\n", "plain", {}, {});
    const del = r.lines.find((l) => l.kind === "del");
    const add = r.lines.find((l) => l.kind === "add");
    expect(r.lines.length).toBeGreaterThan(0);
    expect(del?.a).toBe("b");
    expect(del?.aNum).toBe(2);
    expect(add?.b).toBe("c");
    expect(add?.bNum).toBe(2);
  });

  it("uses identical file names so diff2html does not report a rename", () => {
    const r = computeDiff("a\nb\n", "a\nc\n", "plain", {}, {});
    expect(r.patch).toContain("--- diff");
    expect(r.patch).toContain("+++ diff");
    expect(r.patch).not.toMatch(/similarity index|rename from|rename to/);
  });
});
