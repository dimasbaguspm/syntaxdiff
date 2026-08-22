import { describe, expect, it } from "vitest";
import { goAdapter } from "@/modules/engine/lib/adapters/go";

describe("goAdapter", () => {
  it("has the expected id and label", () => {
    expect(goAdapter.id).toBe("go");
    expect(goAdapter.label).toBe("Go");
  });

  it("is formatter-disabled (no pure-JS gofmt)", () => {
    expect(goAdapter.formatterDisabled).toBe(true);
    expect(goAdapter.formatAsync).toBeUndefined();
  });

  it("detects Go with high confidence", () => {
    const sample = `package main

import "fmt"

func main() {
    fmt.Println("hello")
    x := 42
}`;
    expect(goAdapter.detect(sample)).toBeGreaterThan(0.8);
  });

  it("returns 0 for empty input", () => {
    expect(goAdapter.detect("")).toBe(0);
  });

  it("normalizes whitespace (CRLF + trailing)", () => {
    expect(goAdapter.format("package main\r\nfunc main() {}\t", {})).toEqual({
      canonical: "package main\nfunc main() {}",
    });
  });
});
