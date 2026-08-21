import { beforeEach, describe, expect, it } from "vitest";
import {
  db,
  saveDiff,
  getDiff,
  listDiffs,
  deleteDiff,
  clearDiffs,
  type DiffRecord,
} from "@/core/db";

function makeRecord(over: Partial<DiffRecord> = {}): Omit<DiffRecord, "id"> {
  return {
    createdAt: Date.now(),
    lang: "plain",
    opts: {},
    a: "line a\n",
    b: "line b\n",
    patch: "@@ diff @@",
    lines: [],
    added: 1,
    removed: 1,
    ...over,
  };
}

beforeEach(async () => {
  await db.diffs.clear();
});

describe("db", () => {
  it("saveDiff returns an id and getDiff reads it back", async () => {
    const rec = makeRecord({ a: "hello\n", b: "world\n" });
    const id = await saveDiff(rec);

    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);

    const read = await getDiff(id);
    expect(read).toBeDefined();
    expect(read!.id).toBe(id);
    expect(read!.a).toBe("hello\n");
    expect(read!.b).toBe("world\n");
    expect(read!.lang).toBe("plain");
  });

  it("getDiff returns undefined for a missing id", async () => {
    const read = await getDiff("missing-id");
    expect(read).toBeUndefined();
  });

  it("listDiffs returns diffs newest-first", async () => {
    const older = await saveDiff(makeRecord({ createdAt: 1000 }));
    const newer = await saveDiff(makeRecord({ createdAt: 2000 }));

    const list = await listDiffs();
    expect(list.map((d) => d.id)).toEqual([newer, older]);
    expect(list[0].createdAt).toBeGreaterThan(list[1].createdAt);
  });

  it("deleteDiff removes a saved diff", async () => {
    const id = await saveDiff(makeRecord());
    expect(await getDiff(id)).toBeDefined();

    await deleteDiff(id);
    expect(await getDiff(id)).toBeUndefined();
  });

  it("clearDiffs empties the table", async () => {
    await saveDiff(makeRecord());
    await saveDiff(makeRecord());

    await clearDiffs();
    expect(await listDiffs()).toEqual([]);
  });
});
