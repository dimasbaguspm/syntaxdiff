import { describe, expect, it } from "vitest";
import { csvAdapter } from "./csv";
import { parseCsv, serializeCsv } from "./csv";

describe("parseCsv", () => {
  it("parses simple rows and handles CRLF", () => {
    expect(parseCsv("a,b,c\r\n1,2,3\r\n")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("handles quoted fields with commas, quotes and newlines", () => {
    expect(
      parseCsv('name,note\n"Smith, John","said ""hi""\nand more"'),
    ).toEqual([
      ["name", "note"],
      ["Smith, John", 'said "hi"\nand more'],
    ]);
  });

  it("throws on an unterminated quoted field", () => {
    expect(() => parseCsv('a,"unterminated')).toThrow(/Unterminated/);
  });
});

describe("serializeCsv", () => {
  it("round-trips parsed rows and appends a trailing newline", () => {
    const rows = [
      ["name", "note"],
      ["Smith, John", "plain"],
    ];
    expect(serializeCsv(rows)).toBe('name,note\n"Smith, John",plain\n');
  });
});

describe("csvAdapter", () => {
  it("detects consistent multi-column CSV", () => {
    expect(csvAdapter.detect("a,b\n1,2\n3,4\n")).toBeGreaterThan(0.5);
    expect(csvAdapter.detect("just some prose\nwith lines\n")).toBe(0);
  });

  it("canonicalizes with consistent quoting, trimming and trailing newline", () => {
    const out = csvAdapter.format(" name , age \n Alice , 30 \n Bob ,40 ", {});
    expect(out.canonical).toBe("name,age\nAlice,30\nBob,40\n");
  });

  it("sorts data rows while keeping the header when enabled", () => {
    const out = csvAdapter.format("name,n\nb,2\na,1\nc,3", { sortRows: true });
    expect(out.canonical).toBe("name,n\na,1\nb,2\nc,3\n");
  });

  it("keeps original order when sort is off", () => {
    const out = csvAdapter.format("name,n\nb,2\na,1\nc,3", {});
    expect(out.canonical).toBe("name,n\nb,2\na,1\nc,3\n");
  });
});