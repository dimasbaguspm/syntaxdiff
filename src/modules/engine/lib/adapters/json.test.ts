import { describe, expect, it } from "vitest";
import { getWorkerAdapter } from "@/core/worker/prettier-adapters";
import { jsonAdapter } from "@/modules/engine/lib/adapters/json";

describe("jsonAdapter", () => {
  it("detects JSON", () => {
    expect(jsonAdapter.detect('{"a":1}')).toBe(1);
    expect(jsonAdapter.detect('["a", 1]')).toBe(1);
    expect(jsonAdapter.detect("hello world")).toBe(0);
  });

  it("detects malformed JSON as JSON-shaped", () => {
    expect(jsonAdapter.detect('{"a":')).toBe(0.6);
  });

  it("canonicalizes and preserves key order (no sorting)", () => {
    const { canonical } = jsonAdapter.format('{"b":1,"a":2}', {});
    expect(canonical).toBe('{\n  "b": 1,\n  "a": 2\n}');
  });

  it("preserves array order", () => {
    const { canonical } = jsonAdapter.format('{"a":[3,1,2]}', {});
    expect(canonical.indexOf("3")).toBeLessThan(canonical.indexOf("1"));
  });

  it("minifies when requested", () => {
    const { canonical } = jsonAdapter.format('{ "a": 1, "b": 2 }', { minify: true });
    expect(canonical).toBe('{"a":1,"b":2}');
  });

  it("throws ParseError on invalid input", () => {
    expect(() => jsonAdapter.format("{oops", {})).toThrow(/Invalid JSON/);
  });

  it("worker formatAsync applies formatting, preserving key order", async () => {
    const out = await getWorkerAdapter("json").formatAsync!('{"b":1,"a":2}', {});
    // The formatter keeps short JSON on one line (fits printWidth); key order
    // is preserved (no sorting).
    expect(out.canonical).toBe('{ "b": 1, "a": 2 }\n');
  });

  it("worker formatAsync never throws and falls back on invalid syntax", async () => {
    const out = await getWorkerAdapter("json").formatAsync!("{not json", {});
    expect(typeof out.canonical).toBe("string");
  });
});
