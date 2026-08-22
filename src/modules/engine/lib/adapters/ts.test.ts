import { describe, expect, it } from "vitest";
import { getWorkerAdapter } from "@/core/worker/prettier-adapters";
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

  it("exposes the expected formatting toggles", () => {
    expect(tsAdapter.toggles.map((t) => t.id)).toEqual([
      "printWidth",
      "tabWidth",
      "useTabs",
      "semi",
      "singleQuote",
      "trailingComma",
      "bracketSpacing",
      "arrowParens",
    ]);
  });

  it("worker formatAsync applies real formatting (TS)", async () => {
    const out = await getWorkerAdapter("ts").formatAsync!(
      "const x:number=1;interface A{b:string}",
      {},
    );
    expect(out.canonical).toBe("const x: number = 1;\ninterface A {\n  b: string;\n}\n");
  });

  it("worker formatAsync reindents unformatted TS", async () => {
    const out = await getWorkerAdapter("ts").formatAsync!("if(x){\nconsole.log(x)\n}", {});
    expect(out.canonical).toBe("if (x) {\n  console.log(x);\n}\n");
  });
});
