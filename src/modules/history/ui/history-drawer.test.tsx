import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { db, getDiff, saveDiff } from "@/core/db";
import type { DiffRecord } from "@/core/db";
import { HistoryDrawer } from "./history-drawer";

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderDrawer(open = true, onClose = vi.fn()) {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HistoryDrawer open={open} onClose={onClose} />
              <LocationDisplay />
            </>
          }
        />
        <Route path="/diff/:id" element={<LocationDisplay />} />
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

beforeEach(async () => {
  await db.diffs.clear();
});

afterEach(() => cleanup());

describe("HistoryDrawer", () => {
  it("shows the empty state when there are no diffs", async () => {
    renderDrawer();
    expect(
      await screen.findByText("No diffs yet. Compare something to see it here."),
    ).toBeInTheDocument();
  });

  it("lists diffs seeded in IndexedDB", async () => {
    const id = await saveDiff(makeRecord());
    renderDrawer();
    expect(await screen.findByText("Source A → Source B")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getByText("−1")).toBeInTheDocument();
    expect(id).toBeTruthy();
  });

  it("shows user-assigned source labels in the history entry", async () => {
    await saveDiff(makeRecord({ labelA: "Old config", labelB: "New config" }));
    renderDrawer();
    expect(await screen.findByText("Old config → New config")).toBeInTheDocument();
  });

  it("does not render the drawer body when closed", async () => {
    await saveDiff(makeRecord());
    renderDrawer(false);
    expect(screen.queryByText("Source A → Source B")).toBeNull();
  });

  it("navigates to /diff/:id when a diff is opened", async () => {
    await saveDiff(makeRecord());
    renderDrawer();
    const item = await screen.findByText("Source A → Source B");
    fireEvent.click(item);
    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toMatch(/^\/diff\/[0-9a-f-]+$/);
    });
  });

  it("calls onClose when a diff is opened", async () => {
    const onClose = vi.fn();
    await saveDiff(makeRecord());
    renderDrawer(true, onClose);
    const item = await screen.findByText("Source A → Source B");
    fireEvent.click(item);
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("deletes a diff from the database", async () => {
    const id = await saveDiff(makeRecord());
    renderDrawer();
    await screen.findByText("Source A → Source B");
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(async () => {
      expect(await getDiff(id)).toBeUndefined();
    });
    await waitFor(() => {
      expect(screen.queryByText("Source A → Source B")).toBeNull();
    });
  });
});
