import { describe, expect, it } from "vitest";
import { ParseError } from "../types";
import { xmlAdapter } from "./xml";

describe("xmlAdapter", () => {
  it("detects XML by leading angle bracket", () => {
    expect(xmlAdapter.detect("<root></root>")).toBe(1);
    expect(xmlAdapter.detect("  <root/>")).toBe(1);
  });

  it("does not detect non-XML text", () => {
    expect(xmlAdapter.detect("hello world")).toBe(0);
    expect(xmlAdapter.detect("")).toBe(0);
  });

  it("builds canonical xml", () => {
    const { canonical } = xmlAdapter.format("<a><b>1</b></a>", {});
    expect(canonical).toContain("<a>");
    expect(canonical).toContain("<b>1</b>");
    expect(canonical).toContain("</a>");
  });

  it("sorts keys/elements recursively when requested", () => {
    const { canonical } = xmlAdapter.format("<a><z>1</z><y>2</y></a>", { sortKeys: true });
    expect(canonical.indexOf("<y>2</y>")).toBeLessThan(canonical.indexOf("<z>1</z>"));
  });

  it("preserves element order when sortKeys is off", () => {
    const { canonical } = xmlAdapter.format("<a><z>1</z><y>2</y></a>", {});
    expect(canonical.indexOf("<z>1</z>")).toBeLessThan(canonical.indexOf("<y>2</y>"));
  });

  it("preserves attributes", () => {
    const { canonical } = xmlAdapter.format('<a id="7"><b>1</b></a>', {});
    expect(canonical).toContain('id="7"');
  });

  it("throws ParseError on invalid XML", () => {
    // fast-xml-parser is lenient about mismatched tags but throws on an
    // unterminated/unparseable tag expression.
    expect(() => xmlAdapter.format("<a", {})).toThrow(ParseError);
    expect(() => xmlAdapter.format("<<<", {})).toThrow(/Invalid XML/);
  });
});
