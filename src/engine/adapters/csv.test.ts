import { describe, expect, it } from "vitest";
import { csvAdapter, parseCsv, serializeAlignedCsv, serializeCsv } from "./csv";

describe("parseCsv", () => {
  it("parses simple rows and handles CRLF", () => {
    expect(parseCsv("a,b,c\r\n1,2,3\r\n")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("handles quoted fields with commas, quotes and newlines", () => {
    expect(parseCsv('name,note\n"Smith, John","said ""hi""\nand more"')).toEqual([
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

describe("serializeAlignedCsv", () => {
  it("pads columns to their widest cell with | separators", () => {
    const rows = [
      ["id", "first_name", "email"],
      ["101", "John", "john.doe@example.com"],
      ["102", "Jane", "jane@example.com"],
    ];
    const out = serializeAlignedCsv(rows).trim().split("\n").map((l) => l.trimEnd());
    expect(out).toEqual([
      "id  | first_name | email",
      "101 | John       | john.doe@example.com",
      "102 | Jane       | jane@example.com",
    ]);
  });
});

describe("csvAdapter", () => {
  it("detects consistent multi-column CSV", () => {
    expect(csvAdapter.detect("a,b\n1,2\n3,4\n")).toBeGreaterThan(0.5);
    expect(csvAdapter.detect("just some prose\nwith lines\n")).toBe(0);
  });

  it("aligns columns and trims cells by default", () => {
    // QA fixture: messy quoting/spacing in source A.
    const messy = 'id, "first_name" , last_name ,  email  , salary\n' +
      '101,"John", Doe , john.doe@example.com , 75000\n' +
      '102, Jane , Smith , "jane.smith@example.com", 82000\n';
    const out = csvAdapter.format(messy, {});
    const lines = out.canonical.trim().split("\n");
    expect(lines[0]).toContain("id");
    expect(lines[0]).toContain("first_name");
    expect(lines[1]).toContain("101 | John");
    expect(lines[2]).toContain("102 | Jane");
    // aligned: every non-empty line has the same pipe count (5 columns here)
    expect(lines.every((l) => l.split("|").length === 5)).toBe(true);
  });

  it("produces comma-separated canonical when alignment is off", () => {
    const out = csvAdapter.format(" name , age \n Alice , 30 \n Bob ,40 ", {
      alignColumns: false,
    });
    expect(out.canonical).toBe("name,age\nAlice,30\nBob,40\n");
  });

  it("sorts data rows while keeping the header when enabled", () => {
    const out = csvAdapter.format("name,n\nb,2\na,1\nc,3", {
      sortRows: true,
      alignColumns: false,
    });
    expect(out.canonical).toBe("name,n\na,1\nb,2\nc,3\n");
  });

  it("keeps original order when sort is off", () => {
    const out = csvAdapter.format("name,n\nb,2\na,1\nc,3", { alignColumns: false });
    expect(out.canonical).toBe("name,n\nb,2\na,1\nc,3\n");
  });
});
