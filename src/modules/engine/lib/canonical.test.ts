import { describe, expect, it } from "vitest";
import { canonicalize } from "@/modules/engine/lib/canonical";

describe("canonicalize", () => {
  it("sorts object keys recursively when sortKeys is true", () => {
    const input = { b: 1, a: { z: 2, y: 1 }, c: 3 };
    expect(canonicalize(input, true)).toEqual({ a: { y: 1, z: 2 }, b: 1, c: 3 });
  });

  it("preserves insertion order when sortKeys is false", () => {
    const input = { b: 1, a: 2 };
    const out = canonicalize(input, false) as Record<string, number>;
    expect(Object.keys(out)).toEqual(["b", "a"]);
  });

  it("preserves array order even when sorting keys", () => {
    const input = { a: [3, 1, 2] };
    const out = canonicalize(input, true) as { a: number[] };
    expect(out.a).toEqual([3, 1, 2]);
  });

  it("preserves array order with nested objects", () => {
    const input = {
      b: 1,
      a: [
        { y: 1, x: 2 },
        { d: 4, c: 3 },
      ],
    };
    const out = canonicalize(input, true) as {
      a: Array<Record<string, unknown>>;
    };
    expect(out.a.map((o) => Object.keys(o))).toEqual([
      ["x", "y"],
      ["c", "d"],
    ]);
    expect(out.a[0].x).toBe(2);
  });

  it("handles primitives, null, and nested arrays", () => {
    expect(canonicalize(42, true)).toBe(42);
    expect(canonicalize("str", true)).toBe("str");
    expect(canonicalize(true, true)).toBe(true);
    expect(canonicalize(null, true)).toBe(null);
    expect(canonicalize(undefined, true)).toBe(undefined);
    expect(canonicalize([1, "a", null, { b: 1 }], true)).toEqual([1, "a", null, { b: 1 }]);
  });

  it("returns a new object and does not mutate the input", () => {
    const input = { b: 1, a: 2 };
    const out = canonicalize(input, true) as Record<string, unknown>;
    expect(out).not.toBe(input);
    expect(input).toEqual({ b: 1, a: 2 });
  });
});
