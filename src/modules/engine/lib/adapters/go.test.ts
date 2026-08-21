import { describe, expect, it } from "vitest";
import { goAdapter } from "@/modules/engine/lib/adapters/go";

describe("goAdapter", () => {
  it("has the expected id and label", () => {
    expect(goAdapter.id).toBe("go");
    expect(goAdapter.label).toBe("Go");
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

  it("exposes the expected toggles", () => {
    expect(goAdapter.toggles.map((t) => t.id)).toEqual(["trimTrailing", "normalizeIndent"]);
  });

  it("formatAsync canonicalizes Go (best-effort; no pure-JS gofmt)", async () => {
    const out = await goAdapter.formatAsync!(
      'package main\nfunc main(){\nfmt.Println("hi")\n}\n',
      {},
    );
    expect(out.canonical).toBe('package main\nfunc main(){\n  fmt.Println("hi")\n}\n');
  });
});
