import { describe, expect, it } from "vitest";
import { tsAdapter } from "@/modules/engine/lib/adapters/ts";

describe("tsAdapter", () => {
  it("has the expected id and label", () => {
    expect(tsAdapter.id).toBe("ts");
    expect(tsAdapter.label).toBe("TypeScript");
  });

  it("detects TypeScript with high confidence", () => {
    const sample = `interface User {
  id: string;
  name: string;
}
type Role = "admin" | "user";
function getUser<T>(id: T): Promise<User> {
  return fetch(\`/users/\${id}\`).then((r) => r.json() as Promise<User>);
}`;
    expect(tsAdapter.detect(sample)).toBeGreaterThan(0.8);
  });

  it("returns 0 for empty input", () => {
    expect(tsAdapter.detect("")).toBe(0);
  });

  it("trims trailing whitespace by default", () => {
    expect(tsAdapter.format("const x: number = 1;   \n", {})).toEqual({
      canonical: "const x: number = 1;\n",
    });
  });

  it("exposes the expected toggles", () => {
    expect(tsAdapter.toggles.map((t) => t.id)).toEqual(["trimTrailing", "normalizeIndent"]);
  });
});
