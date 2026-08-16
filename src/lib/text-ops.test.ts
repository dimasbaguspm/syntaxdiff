import { describe, expect, it } from "vitest";
import { escapeJsonString, looksEscaped, unescapeJsonString } from "./text-ops";

describe("text-ops", () => {
  it("escapeJsonString wraps in quotes and escapes", () => {
    expect(escapeJsonString('a\n"b"')).toBe('"a\\n\\"b\\""');
  });

  it("unescapeJsonString parses a quoted JSON string", () => {
    expect(unescapeJsonString('"a\\nb"')).toBe("a\nb");
  });

  it("unescapeJsonString pretty-prints a JSON object", () => {
    expect(unescapeJsonString('{"a":1}')).toContain('"a": 1');
  });

  it("unescapeJsonString returns the input on parse failure", () => {
    expect(unescapeJsonString("not json")).toBe("not json");
  });

  it("looksEscaped detects quoted strings and escape sequences", () => {
    expect(looksEscaped('"hi"')).toBe(true);
    expect(looksEscaped("a\\nb")).toBe(true);
    expect(looksEscaped("plain")).toBe(false);
  });
});
