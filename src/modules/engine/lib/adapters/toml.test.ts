import { describe, expect, it } from "vitest";
import { ParseError } from "@/modules/engine/lib/types";
import { tomlAdapter } from "@/modules/engine/lib/adapters/toml";

describe("tomlAdapter", () => {
  it("detects key-value and table TOML", () => {
    expect(tomlAdapter.detect("a = 1\nb = 2\n")).toBe(1);
    expect(tomlAdapter.detect("[server]\nport = 8080\n")).toBe(1);
  });

  it("does not detect non-TOML text", () => {
    expect(tomlAdapter.detect("just prose here")).toBe(0);
    expect(tomlAdapter.detect("")).toBe(0);
  });

  it("round-trips a TOML doc", () => {
    const { canonical } = tomlAdapter.format('name = "syntaxdiff"\ncount = 3\n', {});
    expect(canonical).toContain('name = "syntaxdiff"');
    expect(canonical).toContain("count = 3");
  });

  it("sorts keys recursively when requested", () => {
    const { canonical } = tomlAdapter.format("b = 1\na = 2\n", { sortKeys: true });
    expect(canonical.indexOf("a = 2")).toBeLessThan(canonical.indexOf("b = 1"));
  });

  it("keeps original key order when sortKeys is off", () => {
    const { canonical } = tomlAdapter.format("b = 1\na = 2\n", {});
    expect(canonical.indexOf("b = 1")).toBeLessThan(canonical.indexOf("a = 2"));
  });

  it("preserves array order when sorting keys", () => {
    const { canonical } = tomlAdapter.format("arr = [3, 1, 2]\n", { sortKeys: true });
    expect(canonical.indexOf("3")).toBeLessThan(canonical.indexOf("1"));
    expect(canonical.indexOf("1")).toBeLessThan(canonical.indexOf("2"));
  });

  it("throws ParseError on invalid TOML", () => {
    expect(() => tomlAdapter.format("a === b\n", {})).toThrow(ParseError);
    expect(() => tomlAdapter.format("a === b\n", {})).toThrow(/Invalid TOML/);
  });
});
