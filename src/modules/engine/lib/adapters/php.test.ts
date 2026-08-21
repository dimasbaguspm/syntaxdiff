import { describe, expect, it } from "vitest";
import { phpAdapter } from "@/modules/engine/lib/adapters/php";

describe("phpAdapter", () => {
  it("has the expected id and label", () => {
    expect(phpAdapter.id).toBe("php");
    expect(phpAdapter.label).toBe("PHP");
  });

  it("detects PHP with high confidence", () => {
    const sample = `<?php
function greet($name) {
    echo "Hello, $name";
    return $name;
}
?>`;
    expect(phpAdapter.detect(sample)).toBeGreaterThan(0.8);
  });

  it("returns 0 for empty input", () => {
    expect(phpAdapter.detect("")).toBe(0);
  });

  it("normalizes whitespace (CRLF + trailing)", () => {
    expect(phpAdapter.format("<?php\r\necho 'hi';   \n", {})).toEqual({
      canonical: "<?php\necho 'hi';\n",
    });
  });

  it("exposes the expected toggles", () => {
    expect(phpAdapter.toggles.map((t) => t.id)).toEqual(["trimTrailing", "normalizeIndent"]);
  });
});
