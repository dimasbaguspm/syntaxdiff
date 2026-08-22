import { describe, expect, it } from "vitest";
import { adapters, autoDetect } from "@/modules/engine/lib/registry";
import { sqlAdapter } from "@/modules/engine/lib/adapters/sql";
import { jsonAdapter } from "@/modules/engine/lib/adapters/json";
import { xmlAdapter } from "@/modules/engine/lib/adapters/xml";
import { yamlAdapter } from "@/modules/engine/lib/adapters/yaml";
import { tomlAdapter } from "@/modules/engine/lib/adapters/toml";
import { csvAdapter } from "@/modules/engine/lib/adapters/csv";
import { json5Adapter } from "@/modules/engine/lib/adapters/json5";

describe("autoDetect", () => {
  it("detects JSON", () => {
    expect(autoDetect('{"a":1}').id).toBe("json");
  });
  it("detects YAML", () => {
    expect(autoDetect("name: Mukti\nage: 31\n").id).toBe("yaml");
  });
  it("detects SQL", () => {
    expect(autoDetect("SELECT a, b FROM users WHERE id = 1").id).toBe("sql");
  });
  it("falls back to plain text", () => {
    expect(autoDetect("just some arbitrary text here").id).toBe("plain");
  });
});

describe("autoDetect — every adapter scores within [0,1]", () => {
  it("never returns a value outside the calibrated range", () => {
    const samples = [
      "",
      "   ",
      "fjwoeij foij wofjwe o",
      "1234567890 !!! ???",
      '{"a":1}',
      "name: x\ny: 1\n",
      "SELECT 1",
      "a,b\n1,2\n3,4\n",
      "a = 1\n[b]\nc = 2\n",
      "<root><child/></root>",
    ];
    for (const input of samples) {
      for (const a of adapters) {
        const s = a.detect(input);
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("sqlAdapter", () => {
  it("uppercases keywords by default", () => {
    const { canonical } = sqlAdapter.format("select a from t", {});
    expect(canonical).toMatch(/SELECT/);
  });
  it("detects SQL", () => {
    expect(sqlAdapter.detect("create table x (id int)")).toBe(1);
  });
  it("returns 0 for empty / whitespace input", () => {
    expect(sqlAdapter.detect("")).toBe(0);
    expect(sqlAdapter.detect("   \n  ")).toBe(0);
  });
  it("returns 0 for non-SQL prose (wrong language)", () => {
    expect(sqlAdapter.detect("some plain text\nwith lines")).toBe(0);
    expect(sqlAdapter.detect("function add(a,b){return a+b}")).toBe(0);
  });
});

describe("jsonAdapter", () => {
  it("detects valid JSON as 1", () => {
    expect(jsonAdapter.detect('{"a":1}')).toBe(1);
    expect(jsonAdapter.detect('["a", 1]')).toBe(1);
  });
  it("scores malformed-but-JSON-shaped input at 0.6", () => {
    expect(jsonAdapter.detect('{"a":')).toBe(0.6);
  });
  it("returns 0 for non-JSON text", () => {
    expect(jsonAdapter.detect("hello world")).toBe(0);
    expect(jsonAdapter.detect("")).toBe(0);
  });
});

describe("json5Adapter", () => {
  it("detects JSON-shaped input at 1 when it parses", () => {
    expect(json5Adapter.detect('{"a": 1}')).toBe(1);
  });
  it("returns 0 for prose", () => {
    expect(json5Adapter.detect("just words")).toBe(0);
  });
});

describe("yamlAdapter", () => {
  it("detects valid YAML at 1", () => {
    expect(yamlAdapter.detect("name: Mukti\nage: 31\n")).toBe(1);
    expect(yamlAdapter.detect("- a\n- b\n")).toBe(1);
    expect(yamlAdapter.detect("---\nname: x\n")).toBe(1);
  });
  it("returns 0.3 for YAML-shaped-but-unparseable input", () => {
    // `key:` with a broken value still looks like YAML but fails to parse.
    expect(yamlAdapter.detect("foo: : :\nbar: 1\n")).toBe(0.3);
  });
  it("returns 0 for non-YAML prose", () => {
    expect(yamlAdapter.detect("just some prose text")).toBe(0);
    expect(yamlAdapter.detect("")).toBe(0);
  });
});

describe("tomlAdapter", () => {
  it("detects valid TOML at 1", () => {
    expect(tomlAdapter.detect("a = 1\nb = 2\n")).toBe(1);
    expect(tomlAdapter.detect("[server]\nport = 8080\n")).toBe(1);
  });
  it("returns 0.3 for TOML-shaped-but-unparseable input", () => {
    expect(tomlAdapter.detect("a === b\nc = 2\n")).toBe(0.3);
  });
  it("returns 0 for non-TOML prose", () => {
    expect(tomlAdapter.detect("just prose here")).toBe(0);
    expect(tomlAdapter.detect("")).toBe(0);
  });
});

describe("xmlAdapter", () => {
  it("detects parseable XML at 1", () => {
    expect(xmlAdapter.detect("<root></root>")).toBe(1);
    expect(xmlAdapter.detect("  <root/>")).toBe(1);
  });
  it("returns 0.3 for tag-shaped-but-unparseable markup", () => {
    // fast-xml-parser is lenient, but a bare/garbled tag expression it cannot
    // produce a document from still surfaces at low confidence.
    expect(xmlAdapter.detect("<<<")).toBe(0.3);
  });
  it("returns 0 for non-XML text", () => {
    expect(xmlAdapter.detect("hello world")).toBe(0);
    expect(xmlAdapter.detect("")).toBe(0);
  });
});

describe("csvAdapter", () => {
  it("detects consistent multi-column CSV at 0.7", () => {
    expect(csvAdapter.detect("a,b\n1,2\n3,4\n")).toBe(0.7);
  });
  it("detects tab-delimited input", () => {
    expect(csvAdapter.detect("a\tb\n1\t2\n3\t4\n")).toBe(0.7);
  });
  it("returns 0 for single-column / prose input", () => {
    expect(csvAdapter.detect("just some prose\nwith lines\n")).toBe(0);
    expect(csvAdapter.detect("onecol\nanother\n")).toBe(0);
    expect(csvAdapter.detect("")).toBe(0);
  });
});
