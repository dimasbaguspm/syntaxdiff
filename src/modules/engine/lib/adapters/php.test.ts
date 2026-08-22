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

  it("declares Prettier option toggles", () => {
    expect(phpAdapter.toggles.some((t) => t.id === "printWidth")).toBe(true);
    expect(phpAdapter.toggles.some((t) => t.id === "tabWidth")).toBe(true);
  });

  it("formatAsync is enabled and never throws (falls back on no PHP runtime)", async () => {
    const out = await phpAdapter.formatAsync!("<?php\nfunction f(){\necho 'x';\n}\n", {});
    expect(typeof out.canonical).toBe("string");
    expect(out.canonical.length).toBeGreaterThan(0);
  });
});
