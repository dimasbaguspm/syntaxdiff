import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { DiffView } from "./diff-view";
import type { DiffLine } from "../engine";

const LINES: DiffLine[] = [
  { kind: "ctx", a: "line1", aNum: 1, b: "line1", bNum: 1 },
  { kind: "del", a: "old line", aNum: 2, b: null, bNum: null },
  { kind: "add", a: null, aNum: null, b: "new line", bNum: 2 },
  { kind: "ctx", a: "line3", aNum: 3, b: "line3", bNum: 3 },
];

afterEach(() => cleanup());

describe("DiffView", () => {
  it("renders two full-height Source panes with a draggable split in split view", () => {
    const { container } = render(<DiffView lines={LINES} mode="split" />);
    expect(screen.getByText("Source A")).toBeInTheDocument();
    expect(screen.getByText("Source B")).toBeInTheDocument();
    // A + B panes each render every diff row
    expect(container.querySelectorAll(".dv-row").length).toBe(LINES.length * 2);
    // draggable split divider from SplitPanes
    expect(container.querySelector('[role="separator"]')).not.toBeNull();
  });

  it("renders the correct content on each side in split view", () => {
    render(<DiffView lines={LINES} mode="split" />);
    expect(screen.getAllByText("line1").length).toBe(2); // context on both sides
    expect(screen.getByText("old line")).toBeInTheDocument(); // A side only
    expect(screen.getByText("new line")).toBeInTheDocument(); // B side only
  });

  it("renders a unified interleaved view with markers and no side labels", () => {
    render(<DiffView lines={LINES} mode="unified" />);
    expect(screen.queryByText("Source A")).not.toBeInTheDocument();
    expect(screen.queryByText("Source B")).not.toBeInTheDocument();
    expect(screen.getByText("old line")).toBeInTheDocument();
    expect(screen.getByText("new line")).toBeInTheDocument();
    expect(screen.getAllByText("+").length).toBe(1);
    expect(screen.getAllByText("−").length).toBe(1);
  });
});
