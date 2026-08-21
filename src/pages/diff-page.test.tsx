import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useStore } from "@/core/store";
import { db, saveDiff } from "@/core/db";
import type { DiffRecord } from "@/core/db";
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
    lines: [],
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
  it("renders the language badge and a full-height diff for a seeded diff", async () => {
    const id = await saveDiff(makeRecord());
    renderDiff(`/diff/${id}`);
    expect(await screen.findByText("JSON")).toBeInTheDocument();
    expect(document.querySelector(".diff-view")).not.toBeNull();
  });

  it("renders Source A and Source B labels in split view", async () => {
    useStore.setState({ mode: "split" });
    const id = await saveDiff(makeRecord());
    renderDiff(`/diff/${id}`);
    expect(await screen.findByText("Source A")).toBeInTheDocument();
    expect(screen.getByText("Source B")).toBeInTheDocument();
  });

  it("shows 'Diff not found' for an unknown id", async () => {
    renderDiff("/diff/00000000-0000-0000-0000-000000000000");
    expect(await screen.findByText("Diff not found.")).toBeInTheDocument();
  });
});
