import { describe, expect, it } from "vitest";
import { sqlAdapter } from "./sql";

describe("sqlAdapter", () => {
  it("detects common statement-leading keywords", () => {
    for (const kw of [
      "SELECT",
      "INSERT",
      "UPDATE",
      "DELETE",
      "CREATE",
      "ALTER",
      "DROP",
      "WITH",
      "SET",
      "MERGE",
    ]) {
      expect(sqlAdapter.detect(`${kw} * FROM t`)).toBe(1);
    }
    // Case-insensitive and tolerant of leading whitespace.
    expect(sqlAdapter.detect("   select 1")).toBe(1);
  });

  it("does not detect non-SQL prose", () => {
    expect(sqlAdapter.detect("some plain text\nwith lines")).toBe(0);
  });

  it("uppercases keywords by default and preserves them when toggled off", () => {
    const sql = "select id from users where active = true";
    expect(sqlAdapter.format(sql, {}).canonical).toContain("SELECT");
    expect(sqlAdapter.format(sql, { uppercaseKeywords: false }).canonical).toContain("select");
  });

  it("falls back to the generic dialect for an unknown dialect", () => {
    const sql = "select id from users";
    // Must not throw on an invalid dialect — it should gracefully fall back.
    expect(() => sqlAdapter.format(sql, { dialect: "not-a-real-dialect" })).not.toThrow();
  });

  it("returns an empty canonical for empty input", () => {
    expect(sqlAdapter.format("   \n  ", {}).canonical).toBe("");
  });
});
