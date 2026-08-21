import { describe, expect, it } from "vitest";
import { computeDiff } from "@/modules/engine/lib/diff";

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

// Comma-trap fixture: commas inside quoted fields, messy spacing/quotes,
// a changed cell and a brand-new row.
const A_COMMA = `id, product_name,  category, price, tags, stock_status
101, "MacBook Pro, 14-inch", Electronics, 1999.99, "laptop, apple, m3", In Stock
102, Magic Mouse 2 ,  Electronics ,  79.00  , "mouse, wireless", "Out of Stock"
103,"Desk Chair, Ergonomic (Black)",Furniture, 250.50, "office, chair, ergonomic",In Stock`;

const B_COMMA = `id,product_name,category,price,tags,stock_status
101,"MacBook Pro, 14-inch",Electronics,1999.99,"laptop, apple, m3",In Stock
102,"Magic Mouse 2",Electronics,79.00,"mouse, wireless",In Stock
103,"Desk Chair, Ergonomic (Black)",Furniture,299.00,"office, chair, ergonomic",In Stock
104,"Keychron K3, Low Profile",Electronics,99.00,"keyboard, mechanical",In Stock`;

describe("csv comma-trap fixture (QA)", () => {
  it("keeps commas inside quotes as one field and normalizes spacing", () => {
    const res = computeDiff(A_COMMA, B_COMMA, "csv", {}, {});

    // Header + row 101 are unchanged once spacing is normalized -> context.
    const ctxMacbook = res.lines.find(
      (l) => l.kind === "ctx" && l.a?.includes("MacBook Pro, 14-inch"),
    );
    expect(ctxMacbook).toBeDefined();
    // The comma stays inside the product field (a single cell, not a split).
    expect(ctxMacbook!.a).toContain("MacBook Pro, 14-inch");
  });

  it("highlights only the stock cell change on row 102", () => {
    const res = computeDiff(A_COMMA, B_COMMA, "csv", {}, {});
    const del102 = res.lines.find((l) => l.kind === "del" && l.a?.includes("102"))!;
    const add102 = res.lines.find((l) => l.kind === "add" && l.b?.includes("102"))!;
    expect(del102.a).toContain("Out of Stock");
    expect(del102.aSeg?.some((s) => s.kind === "del")).toBe(true);
    expect(add102.b).toContain("In Stock");
    expect(add102.bSeg?.some((s) => s.kind === "add")).toBe(true);
    // Shared cells are context, not highlighted -> surgical, not whole-line.
    expect(add102.bSeg?.some((s) => s.kind === "ctx" && s.text.includes("Magic"))).toBe(true);
  });

  it("highlights only the price change on row 103", () => {
    const res = computeDiff(A_COMMA, B_COMMA, "csv", {}, {});
    const del103 = res.lines.find((l) => l.kind === "del" && l.a?.includes("250.50"))!;
    const add103 = res.lines.find((l) => l.kind === "add" && l.b?.includes("299.00"))!;
    expect(del103.a).toContain("250.50");
    expect(del103.aSeg?.some((s) => s.kind === "del")).toBe(true);
    expect(add103.b).toContain("299.00");
    expect(add103.bSeg?.some((s) => s.kind === "add")).toBe(true);
    expect(add103.bSeg?.some((s) => s.kind === "ctx" && s.text.includes("Desk"))).toBe(true);
  });

  it("renders the new row 104 as a full addition with no inline split", () => {
    const res = computeDiff(A_COMMA, B_COMMA, "csv", {}, {});
    const add104 = res.lines.find((l) => l.kind === "add" && l.b?.includes("Keychron"))!;
    expect(add104).toBeDefined();
    expect(add104.bSeg).toBeUndefined(); // unpaired -> whole line green
  });
});
