import { describe, expect, it } from "vitest";
import { computeDiff } from "./diff";

// The exact QA fixture: source A is messy (inconsistent quotes/spaces, 5 cols),
// source B is clean and adds a `status` column.
const A_MESSY = `id, "first_name" , last_name ,  email  , salary
101,"John", Doe , john.doe@example.com , 75000
102, Jane , Smith , "jane.smith@example.com", 82000
103,"Robert", Johnson , rob.j@example.com , 68000`;

const B_CLEAN = `id,first_name,last_name,email,salary,status
101,John,Doe,john.doe@example.com,80000,active
102,Jane,Smith,jane.smith@example.com,85000,active
103,Robert,Johnson,rob.j@example.com,68000,inactive`;

describe("csv inline diff (QA fixture)", () => {
  it("pairs deleted and added rows and highlights only changed words", () => {
    const res = computeDiff(A_MESSY, B_CLEAN, "csv", {}, {});

    // Every changed line should carry inline segments.
    const delLines = res.lines.filter((l) => l.kind === "del");
    const addLines = res.lines.filter((l) => l.kind === "add");
    expect(delLines.length).toBe(4);
    expect(addLines.length).toBe(4);

    for (const line of [...delLines, ...addLines]) {
      expect(line.aSeg !== undefined || line.bSeg !== undefined).toBe(true);
    }

    // Row 101: salary 75000 -> 80000, plus the new status cell.
    const add101 = addLines.find((l) => l.b?.includes("80000"))!;
    expect(add101.bSeg?.some((s) => s.kind === "add" && s.text.includes("80000"))).toBe(true);
    expect(add101.bSeg?.some((s) => s.kind === "ctx" && s.text.includes("101"))).toBe(true);
    // Not the whole line highlighted — the shared row identity is context.
    expect(add101.bSeg!.some((s) => s.kind === "ctx")).toBe(true);

    const del101 = delLines.find((l) => l.a?.includes("75000"))!;
    expect(del101.aSeg?.some((s) => s.kind === "del" && s.text.includes("75000"))).toBe(true);
    expect(del101.aSeg?.some((s) => s.kind === "ctx" && s.text.includes("101"))).toBe(true);
  });

  it("keeps rows aligned so the row key stays in context", () => {
    const res = computeDiff(A_MESSY, B_CLEAN, "csv", {}, {});
    // Row 101 appears on both sides with its shared identifier as context.
    const del101 = res.lines.find((l) => l.kind === "del" && l.a?.includes("101"))!;
    const add101 = res.lines.find((l) => l.kind === "add" && l.b?.includes("101"))!;
    expect(del101.a).toContain("John");
    expect(add101.b).toContain("John");
  });
});
