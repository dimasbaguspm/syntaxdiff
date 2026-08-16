import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useStore } from "../store";
import { db, saveDiff } from "../db";
import type { DiffRecord } from "../db";
import { DiffPage } from "./diff-page";

function renderDiff(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/diff/:id" element={<DiffPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function makeRecord(over: Partial<Omit<DiffRecord, "id">> = {}): Omit<DiffRecord, "id"> {
  return {
    createdAt: Date.now(),
    lang: "json",
    opts: {},
    a: '{"x":1}',
    b: '{"x":2}',
    patch: `--- a\n+++ b\n@@ -1 +1 @@\n-old\n+new\n`,
    added: 1,
    removed: 1,
    ...over,
  };
}

const initial = useStore.getState();

beforeEach(async () => {
  useStore.setState(initial, true);
  await db.diffs.clear();
});

afterEach(() => cleanup());

describe("DiffPage", () => {
  it("renders the language badge and added/removed counts for a seeded diff", async () => {
    const id = await saveDiff(makeRecord());
    renderDiff(`/diff/${id}`);
    expect(await screen.findByText("JSON")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getByText("−1")).toBeInTheDocument();
    expect(document.querySelector(".diff-body")).not.toBeNull();
  });

  it("shows 'Diff not found' for an unknown id", async () => {
    renderDiff("/diff/9999");
    expect(await screen.findByText("Diff not found.")).toBeInTheDocument();
  });

  it("renders the metric tiles (lengths and size delta)", async () => {
    const id = await saveDiff(makeRecord({ a: "111", b: "222222" })); // a=3, b=6, delta=+3
    renderDiff(`/diff/${id}`);
    expect(await screen.findByText("Length A")).toBeInTheDocument();
    expect(screen.getByText("Length B")).toBeInTheDocument();
    expect(screen.getByText("Added")).toBeInTheDocument();
    expect(screen.getByText("Removed")).toBeInTheDocument();
    expect(screen.getByText("Δ Size")).toBeInTheDocument();
    expect(screen.getByText("+3")).toBeInTheDocument();
  });
});
