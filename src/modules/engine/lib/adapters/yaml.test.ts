import { describe, expect, it } from "vitest";
import { ParseError } from "@/modules/engine/lib/types";
import { yamlAdapter } from "@/modules/engine/lib/adapters/yaml";

describe("yamlAdapter", () => {
  it("detects YAML mappings, lists, and document markers", () => {
    expect(yamlAdapter.detect("name: Mukti\nage: 31\n")).toBe(1);
    expect(yamlAdapter.detect("- a\n- b\n")).toBe(1);
    expect(yamlAdapter.detect("---\nname: x\n")).toBe(1);
  });

  it("does not detect non-YAML text", () => {
    expect(yamlAdapter.detect("just some prose text")).toBe(0);
    expect(yamlAdapter.detect("")).toBe(0);
  });

  it("canonicalizes and preserves key order (no sorting)", () => {
    const { canonical } = yamlAdapter.format("b: 2\na: 1\n", { sortKeys: true });
    expect(canonical.indexOf("b: 2")).toBeLessThan(canonical.indexOf("a: 1"));
  });

  it("preserves array order when sorting keys", () => {
    const { canonical } = yamlAdapter.format("a:\n  - 3\n  - 1\n  - 2\n", { sortKeys: true });
    expect(canonical.indexOf("3")).toBeLessThan(canonical.indexOf("1"));
    expect(canonical.indexOf("1")).toBeLessThan(canonical.indexOf("2"));
  });

  it("keeps key order when sortKeys is off", () => {
    const { canonical } = yamlAdapter.format("b: 2\na: 1\n", {});
    expect(canonical.indexOf("b: 2")).toBeLessThan(canonical.indexOf("a: 1"));
  });

  it("round-trips scalar values", () => {
    const { canonical } = yamlAdapter.format("count: 3\nenabled: true\n", {});
    expect(canonical).toContain("count: 3");
    expect(canonical).toContain("enabled: true");
  });

  it("throws ParseError on invalid YAML", () => {
    let err: unknown;
    try {
      yamlAdapter.format(": : :\n", {});
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(ParseError);
    expect((err as Error).message).toMatch(/Invalid YAML/);
  });
});
