import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SplitPanes } from "@/components/split-panes";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

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

  it("mounts a fullscreen touch-none drag shield only while dragging", () => {
    const { container } = render(<SplitPanes left={<div>l</div>} right={<div>r</div>} />);
    expect(container.querySelector(".fixed.inset-0.touch-none")).toBeNull();

    const separator = container.querySelector('[role="separator"]')!;
    fireEvent.pointerDown(separator, { pointerId: 1 });
    const shield = container.querySelector(".fixed.inset-0.touch-none");
    expect(shield).not.toBeNull();

    fireEvent.pointerUp(container.firstElementChild!, { pointerId: 1 });
    expect(container.querySelector(".fixed.inset-0.touch-none")).toBeNull();
  });

  it("ignores pointermove/up from pointers other than the one that started the drag", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 200,
      top: 0,
      left: 0,
      bottom: 200,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    const { container } = render(<SplitPanes left={<div>l</div>} right={<div>r</div>} />);
    const separator = container.querySelector('[role="separator"]')!;
    const leftPane = container.firstElementChild!.children[0] as HTMLElement;

    fireEvent.pointerDown(separator, { pointerId: 7 });
    // A second finger lifting must NOT end the drag...
    fireEvent.pointerUp(container.firstElementChild!, { pointerId: 99 });
    expect(container.querySelector(".fixed.inset-0.touch-none")).not.toBeNull();
    // ...and its moves must not resize panes.
    fireEvent.pointerMove(container.firstElementChild!, { pointerId: 99, clientY: 40 });
    expect(leftPane.style.flexBasis).toBe("50%");

    // The initiating pointer still drives the ratio (vertical: 40/200 = 20%).
    fireEvent.pointerMove(container.firstElementChild!, { pointerId: 7, clientY: 40 });
    expect(leftPane.style.flexBasis).toBe("20%");
  });
});
