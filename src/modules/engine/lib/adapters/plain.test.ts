import { describe, expect, it } from "vitest";
import { plainAdapter } from "@/modules/engine/lib/adapters/plain";

describe("plainAdapter", () => {
  it("is the plain fallback", () => {
    expect(plainAdapter.id).toBe("plain");
    expect(plainAdapter.label).toBe("Plain Text");
    expect(plainAdapter.detect("anything at all")).toBe(0);
  });

  it("returns input unchanged with no options", () => {
    expect(plainAdapter.format("Hello  World", {})).toEqual({ canonical: "Hello  World" });
  });

  it("lowercases when ignoreCase is set", () => {
    expect(plainAdapter.format("Hello WORLD", { ignoreCase: true })).toEqual({
      canonical: "hello world",
    });
  });

  it("strips whitespace when ignoreWhitespace is set", () => {
    expect(plainAdapter.format("a  b \t c\n d", { ignoreWhitespace: true })).toEqual({
      canonical: "abcd",
    });
  });

  it("combines both options", () => {
    expect(plainAdapter.format("Foo  BAR", { ignoreCase: true, ignoreWhitespace: true })).toEqual({
      canonical: "foobar",
    });
  });

  it("exposes the expected toggles", () => {
    expect(plainAdapter.toggles.map((t) => t.id)).toEqual(["ignoreCase", "ignoreWhitespace"]);
  });
});
