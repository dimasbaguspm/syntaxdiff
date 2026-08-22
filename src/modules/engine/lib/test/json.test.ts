import { describe, expect, it } from "vitest";
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
    const { canonical } = jsonAdapter.format('{"b":1,"a":2}', { sortKeys: true });
    expect(canonical).toBe('{\n  "b": 1,\n  "a": 2\n}');
  });

  it("preserves array order (no sorting)", () => {
    const { canonical } = jsonAdapter.format('{"a":[3,1,2]}', { sortKeys: true });
    expect(canonical.indexOf('"a": [')).toBeGreaterThan(-1);
    expect(canonical.indexOf("3")).toBeLessThan(canonical.indexOf("1"));
  });

  it("minifies when requested", () => {
    const { canonical } = jsonAdapter.format('{ "a": 1, "b": 2 }', { minify: true });
    expect(canonical).toBe('{"a":1,"b":2}');
  });

  it("throws ParseError on invalid input", () => {
    expect(() => jsonAdapter.format("{oops", {})).toThrow(/Invalid JSON/);
  });
});
