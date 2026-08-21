import { describe, expect, it } from "vitest";
import { jsAdapter } from "@/modules/engine/lib/adapters/js";

describe("jsAdapter", () => {
  it("has the expected id and label", () => {
    expect(jsAdapter.id).toBe("js");
    expect(jsAdapter.label).toBe("JavaScript");
  });

  it("detects JavaScript with high confidence", () => {
    const sample = `function greet(name) {
  const msg = \`Hello, \${name}\`;
  console.log(msg);
  return msg;
}
export { greet };`;
    expect(jsAdapter.detect(sample)).toBeGreaterThan(0.7);
  });

  it("returns 0 for empty input", () => {
    expect(jsAdapter.detect("")).toBe(0);
    expect(jsAdapter.detect("   ")).toBe(0);
  });

  it("penalizes TypeScript-only syntax", () => {
    const ts = `interface User { id: string; }\ntype R = "a" | "b";`;
    expect(jsAdapter.detect(ts)).toBeLessThan(0.5);
  });

  it("trims trailing whitespace by default", () => {
    expect(jsAdapter.format("const x = 1;   \nlet y = 2;\t", {})).toEqual({
      canonical: "const x = 1;\nlet y = 2;",
    });
  });

  it("normalizes CRLF line endings", () => {
    expect(jsAdapter.format("const a = 1;\r\nconst b = 2;\r\n", {})).toEqual({
      canonical: "const a = 1;\nconst b = 2;\n",
    });
  });

  it("exposes the expected toggles", () => {
    expect(jsAdapter.toggles.map((t) => t.id)).toEqual(["trimTrailing", "normalizeIndent"]);
  });
});
