import { describe, expect, it } from "vitest";
import type { DiffLine } from "@/modules/engine/lib/types";
import { computeChangeGroups } from "./change-groups";

const ln = (kind: DiffLine["kind"]): DiffLine => ({
  kind,
  a: null,
  b: null,
  aNum: null,
  bNum: null,
});
const kinds = (specs: DiffLine["kind"][]): DiffLine[] => specs.map(ln);

describe("computeChangeGroups", () => {
  it("returns one start index per contiguous run of changed lines", () => {
    // ctx, [del add], ctx, [add], del → runs at 1 and 4
    expect(computeChangeGroups(kinds(["ctx", "del", "add", "ctx", "add", "del"]))).toEqual([1, 4]);
  });

  it("returns empty for an all-context diff", () => {
    expect(computeChangeGroups(kinds(["ctx", "ctx"]))).toEqual([]);
  });

  it("returns empty for an empty diff", () => {
    expect(computeChangeGroups([])).toEqual([]);
  });

  it("collapses adjacent add/del pairs into a single group", () => {
    expect(computeChangeGroups(kinds(["del", "add", "add", "del", "del"]))).toEqual([0]);
  });

  it("handles changes at both ends without leading/trailing context", () => {
    expect(computeChangeGroups(kinds(["add", "ctx", "del"]))).toEqual([0, 2]);
  });
});
