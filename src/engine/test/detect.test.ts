import { describe, expect, it } from "vitest";
import { autoDetect } from "../registry";
import { sqlAdapter } from "../adapters/sql";

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

describe("sqlAdapter", () => {
  it("uppercases keywords by default", () => {
    const { canonical } = sqlAdapter.format("select a from t", {});
    expect(canonical).toMatch(/SELECT/);
  });
  it("detects SQL", () => {
    expect(sqlAdapter.detect("create table x (id int)")).toBe(1);
  });
});
