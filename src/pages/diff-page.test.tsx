import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useStore } from "@/core/store";
import { db, saveDiff } from "@/core/db";
import type { DiffRecord } from "@/core/db";
import type { DiffLine } from "@/modules/engine/lib";
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

/** Diff lines with two change groups (lines 1-2 and 4) for nav tests. */
const CHANGED_LINES: DiffLine[] = [
  { kind: "ctx", a: "l0", aNum: 1, b: "l0", bNum: 1 },
  { kind: "del", a: "old", aNum: 2, b: null, bNum: null },
  { kind: "add", a: null, aNum: null, b: "new", bNum: 2 },
  { kind: "ctx", a: "l3", aNum: 3, b: "l3", bNum: 3 },
  { kind: "add", a: null, aNum: null, b: "tail", bNum: 4 },
];

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

  it("renders +N/−N counts beside the language pill", async () => {
    const id = await saveDiff(makeRecord({ added: 3, removed: 7 }));
    renderDiff(`/diff/${id}`);
    expect(await screen.findByText("+3")).toBeInTheDocument();
    expect(screen.getByText("−7")).toBeInTheDocument();
  });

  it("starts change navigation at group 1 of N with Prev disabled", async () => {
    const id = await saveDiff(makeRecord({ lines: CHANGED_LINES }));
    renderDiff(`/diff/${id}`);
    const prev = await screen.findByRole("button", { name: "Previous change" });
    const next = screen.getByRole("button", { name: "Next change" });
    expect(prev).toBeDisabled();
    expect(next).toBeEnabled();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("clamps Next at the last group and hides navigation without changes", async () => {
    const noChanges = await saveDiff(makeRecord({ lines: CHANGED_LINES.slice(0, 1) }));
    const { unmount } = renderDiff(`/diff/${noChanges}`);
    expect(await screen.findByText("JSON")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next change" })).not.toBeInTheDocument();
    unmount();

    const id = await saveDiff(makeRecord({ lines: CHANGED_LINES }));
    renderDiff(`/diff/${id}`);
    fireEvent.click(await screen.findByRole("button", { name: "Next change" }));
    fireEvent.click(screen.getByRole("button", { name: "Next change" })); // clamp at 2 / 2
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next change" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous change" })).toBeEnabled();
  });
});
