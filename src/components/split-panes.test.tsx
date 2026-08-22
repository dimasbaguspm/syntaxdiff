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

    const drive = (orientation: "horizontal" | "vertical", pointerId: number, coord: number) => {
      const { container } = render(
        <SplitPanes orientation={orientation} left={<div>l</div>} right={<div>r</div>} />,
      );
      const separator = container.querySelector('[role="separator"]')!;
      const leftPane = container.firstElementChild!.children[0] as HTMLElement;
      fireEvent.pointerDown(separator, { pointerId });
      // A second finger lifting must NOT end the drag...
      fireEvent.pointerUp(container.firstElementChild!, { pointerId: 99 });
      expect(container.querySelector(".fixed.inset-0.touch-none")).not.toBeNull();
      // ...and its moves must not resize panes.
      const foreign = { pointerId: 99, clientX: coord, clientY: coord };
      fireEvent.pointerMove(container.firstElementChild!, foreign);
      expect(leftPane.style.flexBasis).toBe("50%");
      // The initiating pointer still drives the ratio on the correct axis.
      const own = { pointerId, clientX: coord, clientY: coord };
      fireEvent.pointerMove(container.firstElementChild!, own);
      return leftPane.style.flexBasis;
    };

    // Horizontal: 40/100 = 40% (clamp is 5–95%, so the value passes through).
    expect(drive("horizontal", 7, 40)).toBe("40%");
    // Vertical: 40/200 = 20% (no longer floored at 20% — the old 0.2 floor is gone).
    expect(drive("vertical", 7, 40)).toBe("20%");
    // Horizontal dragged near the edge clamps at the new 5% lower bound.
    expect(drive("horizontal", 7, 2)).toBe("5%");
  });

  it("entry/compare path (vertical orientation, mobile width) resizes and mounts the touch-none shield", () => {
    // Regression: the entry page is vertical on desktop but auto-stacks to a
    // vertical drag on mobile (<768px), where editable <textarea>s otherwise
    // steal the gesture. The shield must mount and the pane must resize.
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
    const real = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { value: 390, configurable: true });

    const { container } = render(
      <SplitPanes orientation="vertical" left={<div>top</div>} right={<div>bottom</div>} />,
    );
    const separator = container.querySelector('[role="separator"]')!;
    const topPane = container.firstElementChild!.children[0] as HTMLElement;

    fireEvent.pointerDown(separator, { pointerId: 3 });
    expect(container.querySelector(".fixed.inset-0.touch-none")).not.toBeNull();
    // Vertical drag on a 390px (mobile) viewport is height-based: 40/200 = 20%.
    fireEvent.pointerMove(container.firstElementChild!, { pointerId: 3, clientY: 40 });
    expect(topPane.style.flexBasis).toBe("20%");

    fireEvent.pointerUp(container.firstElementChild!, { pointerId: 3 });
    expect(container.querySelector(".fixed.inset-0.touch-none")).toBeNull();

    Object.defineProperty(window, "innerWidth", { value: real, configurable: true });
  });
});
