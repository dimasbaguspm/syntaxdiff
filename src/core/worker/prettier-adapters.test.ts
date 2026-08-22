import { describe, expect, it } from "vitest";
import { getWorkerAdapter } from "@/core/worker/prettier-adapters";
import { jsAdapter } from "@/modules/engine/lib/adapters/js";
import { tsAdapter } from "@/modules/engine/lib/adapters/ts";
import { jsonAdapter } from "@/modules/engine/lib/adapters/json";
import { yamlAdapter } from "@/modules/engine/lib/adapters/yaml";
import { xmlAdapter } from "@/modules/engine/lib/adapters/xml";
import { csvAdapter } from "@/modules/engine/lib/adapters/csv";
import { goAdapter } from "@/modules/engine/lib/adapters/go";

describe("plain adapters (main-thread graph)", () => {
  it("never carry a formatAsync pass or plugin wiring", () => {
    const plain = [jsAdapter, tsAdapter, jsonAdapter, yamlAdapter, xmlAdapter, csvAdapter];
    for (const a of plain) {
      expect(a.formatAsync).toBeUndefined();
      expect(a.fmtParser).toBeDefined();
    }
  });

  it("keeps formatter-disabled languages free of formatAsync", () => {
    expect(goAdapter.formatterDisabled).toBe(true);
    expect(goAdapter.formatAsync).toBeUndefined();
  });
});

describe("worker adapters via the heavy formatter (representative subset)", () => {
  it("formats JavaScript (babel)", async () => {
    const out = await getWorkerAdapter("js").formatAsync!("const x=1", {});
    expect(out.canonical).toContain("const x = 1;");
  });

  it("formats TypeScript (babel-ts)", async () => {
    const out = await getWorkerAdapter("ts").formatAsync!("const x:number=1", {});
    expect(out.canonical).toContain("const x: number = 1;");
  });

  it("formats JSON and preserves key order (no sort)", async () => {
    const out = await getWorkerAdapter("json").formatAsync!('{"b":1,"a":2}', {});
    expect(out.canonical.indexOf('"b"')).toBeLessThan(out.canonical.indexOf('"a"'));
  });

  it("formats YAML", async () => {
    const out = await getWorkerAdapter("yaml").formatAsync!("b: 2\na: 1", {});
    expect(out.canonical).toContain("b: 2");
  });

  it("formats XML via its registered plugin", async () => {
    const out = await getWorkerAdapter("xml").formatAsync!("<a><b>x</b></a>", {});
    expect(out.canonical).toContain("<a>");
    expect(out.canonical).toContain("<b>x</b>");
  });

  it("formats SQL via its registered plugin", async () => {
    const out = await getWorkerAdapter("sql").formatAsync!("select a from t", {
      language: "sql",
    });
    expect(out.canonical.toUpperCase()).toContain("SELECT");
  });

  it("formats CSV via the in-repo custom plugin (aligned)", async () => {
    const out = await getWorkerAdapter("csv").formatAsync!("a,b\n1,2", {
      delimiter: ",",
      alignColumns: true,
    });
    expect(out.canonical).toContain("a");
    expect(out.canonical).toContain("|"); // column-aligned table
  });

  it("formats CSV with a semicolon delimiter", async () => {
    const out = await getWorkerAdapter("csv").formatAsync!("a;b\n1;2", {
      delimiter: ";",
      alignColumns: false,
    });
    expect(out.canonical).toContain("a;b");
    expect(out.canonical).toContain("1;2");
  });

  it("formats Go templates via its registered plugin", async () => {
    const out = await getWorkerAdapter("go-template").formatAsync!("{{if .x}}\nhello\n{{end}}", {});
    expect(out.canonical).toContain("{{");
  });

  it("formats Nginx via its registered plugin", async () => {
    const out = await getWorkerAdapter("nginx").formatAsync!("server{listen 80;}", {});
    expect(out.canonical).toContain("server {");
  });

  it("formats Shell via its registered plugin", async () => {
    const out = await getWorkerAdapter("sh").formatAsync!("if [ 1 ]; then echo a; fi", {});
    expect(out.canonical).toContain("echo");
  });

  it("PHP formatAsync never throws even without a PHP runtime (falls back)", async () => {
    const out = await getWorkerAdapter("php").formatAsync!("<?php echo 'x';", {});
    expect(typeof out.canonical).toBe("string");
  });

  it("never throws on invalid syntax for any supported language (falls back)", async () => {
    for (const id of ["js", "json", "xml", "yaml"] as const) {
      const out = await getWorkerAdapter(id).formatAsync!("@@@ not valid @@@", {});
      expect(typeof out.canonical).toBe("string");
    }
  });

  it("formatter-disabled languages expose no formatAsync on the worker side either", () => {
    expect(getWorkerAdapter("go").formatAsync).toBeUndefined();
    expect(getWorkerAdapter("ruby").formatAsync).toBeUndefined();
  });

  it("wraps — not mutates — the plain adapter objects", () => {
    expect(jsAdapter.formatAsync).toBeUndefined();
    expect(getWorkerAdapter("js").formatAsync).toBeDefined();
  });
});
