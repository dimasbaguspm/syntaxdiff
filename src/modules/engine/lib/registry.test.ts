import { describe, expect, it } from "vitest";
import { adapters, autoDetect, getAdapter } from "@/modules/engine/lib/registry";

describe("adapters", () => {
  it("registers all language adapters", () => {
    const ids = adapters.map((a) => a.id);
    expect(ids).toEqual([
      "json",
      "json5",
      "jsonc",
      "yaml",
      "yml",
      "sql",
      "csv",
      "toml",
      "xml",
      "js",
      "ts",
      "go",
      "php",
      "ruby",
      "rust",
      "kotlin",
      "java",
      "html",
      "css",
      "less",
      "scss",
      "markdown",
      "mdx",
      "vue",
      "angular",
      "svelte",
      "astro",
      "graphql",
      "gherkin",
      "handlebars",
      "pug",
      "go-template",
      "nginx",
      "sh",
      "glimmer",
      "plain",
    ]);
  });

  it("every adapter declares a parser or is formatter-disabled", () => {
    for (const a of adapters) {
      if (a.id === "plain") continue;
      expect(a.prettierParser !== undefined || a.formatterDisabled === true).toBe(true);
    }
  });
});

describe("getAdapter", () => {
  it("returns the matching adapter for a known id", () => {
    expect(getAdapter("json").id).toBe("json");
    expect(getAdapter("plain").id).toBe("plain");
  });

  it("throws on unknown id", () => {
    expect(() => getAdapter("nope" as never)).toThrow(/Unknown language: nope/);
  });
});

describe("autoDetect", () => {
  it("returns plain for empty input", () => {
    expect(autoDetect("").id).toBe("plain");
    expect(autoDetect("   ").id).toBe("plain");
  });

  it("returns plain for garbage input", () => {
    expect(autoDetect("fjwoeij foij wofjwe o").id).toBe("plain");
    expect(autoDetect("1234567890 !!! ???").id).toBe("plain");
  });

  it("detects structured input", () => {
    expect(autoDetect('{"a":1}').id).toBe("json");
    expect(autoDetect("name: x\ny: 1\n").id).toBe("yaml");
  });
});
