import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SplitPanes } from "@/components/split-panes";

afterEach(() => cleanup());

describe("SplitPanes", () => {
  it("renders both left and right children", () => {
    render(<SplitPanes left={<div>left pane</div>} right={<div>right pane</div>} />);
    expect(screen.getByText("left pane")).toBeInTheDocument();
    expect(screen.getByText("right pane")).toBeInTheDocument();
  });

  it("renders a role=separator divider", () => {
    render(<SplitPanes left={<div>l</div>} right={<div>r</div>} />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("divider includes a visible grab handle", () => {
    const { container } = render(<SplitPanes left={<div>l</div>} right={<div>r</div>} />);
    const separator = container.querySelector('[role="separator"]');
    expect(separator).not.toBeNull();
    expect(separator!.querySelector("span")).not.toBeNull();
  });

  it("container stacks on mobile and uses md:flex-row on desktop", () => {
    const { container } = render(<SplitPanes left={<div>l</div>} right={<div>r</div>} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("flex-col");
    expect(root.className).toContain("md:flex-row");
  });
});
