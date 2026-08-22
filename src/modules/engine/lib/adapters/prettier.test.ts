import { describe, expect, it } from "vitest";
import { jsAdapter } from "./js";
import { tsAdapter } from "./ts";
import { jsonAdapter } from "./json";
import { yamlAdapter } from "./yaml";
import { xmlAdapter } from "./xml";
import { sqlAdapter } from "./sql";
import { phpAdapter } from "./php";
import { csvAdapter } from "./csv";
import { goTemplateAdapter } from "./go-template";
import { nginxAdapter } from "./nginx";
import { shAdapter } from "./sh";

describe("formatAsync via Prettier (representative subset)", () => {
  it("formats JavaScript (babel)", async () => {
    const out = await jsAdapter.formatAsync!("const x=1", {});
    expect(out.canonical).toContain("const x = 1;");
  });

  it("formats TypeScript (babel-ts)", async () => {
    const out = await tsAdapter.formatAsync!("const x:number=1", {});
    expect(out.canonical).toContain("const x: number = 1;");
  });

  it("formats JSON and preserves key order (no sort)", async () => {
    const out = await jsonAdapter.formatAsync!('{"b":1,"a":2}', {});
    expect(out.canonical.indexOf('"b"')).toBeLessThan(out.canonical.indexOf('"a"'));
  });

  it("formats YAML", async () => {
    const out = await yamlAdapter.formatAsync!("b: 2\na: 1", {});
    expect(out.canonical).toContain("b: 2");
  });

  it("formats XML via @prettier/plugin-xml", async () => {
    const out = await xmlAdapter.formatAsync!("<a><b>x</b></a>", {});
    expect(out.canonical).toContain("<a>");
    expect(out.canonical).toContain("<b>x</b>");
  });

  it("formats SQL via prettier-plugin-sql", async () => {
    const out = await sqlAdapter.formatAsync!("select a from t", { language: "sql" });
    expect(out.canonical.toUpperCase()).toContain("SELECT");
  });

  it("formats CSV via the in-repo custom plugin (aligned)", async () => {
    const out = await csvAdapter.formatAsync!("a,b\n1,2", { delimiter: ",", alignColumns: true });
    expect(out.canonical).toContain("a");
    expect(out.canonical).toContain("|"); // column-aligned table
  });

  it("formats CSV with a semicolon delimiter", async () => {
    const out = await csvAdapter.formatAsync!("a;b\n1;2", { delimiter: ";", alignColumns: false });
    expect(out.canonical).toContain("a;b");
    expect(out.canonical).toContain("1;2");
  });

  it("formats Go templates via @htnabe/prettier-plugin-go-template", async () => {
    const out = await goTemplateAdapter.formatAsync!("{{if .x}}\nhello\n{{end}}", {});
    expect(out.canonical).toContain("{{");
  });

  it("formats Nginx via prettier-plugin-nginx", async () => {
    const out = await nginxAdapter.formatAsync!("server{listen 80;}", {});
    expect(out.canonical).toContain("server {");
  });

  it("formats Shell via prettier-plugin-sh", async () => {
    const out = await shAdapter.formatAsync!("if [ 1 ]; then echo a; fi", {});
    expect(out.canonical).toContain("echo");
  });

  it("PHP formatAsync never throws even without a PHP runtime (falls back)", async () => {
    const out = await phpAdapter.formatAsync!("<?php echo 'x';", {});
    expect(typeof out.canonical).toBe("string");
  });

  it("never throws on invalid syntax for any supported language (falls back)", async () => {
    const langs = [jsAdapter, jsonAdapter, xmlAdapter, yamlAdapter];
    for (const adapter of langs) {
      const out = await adapter.formatAsync!("@@@ not valid @@@", {});
      expect(typeof out.canonical).toBe("string");
    }
  });
});
