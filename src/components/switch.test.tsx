import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Switch } from "@/components/switch";

afterEach(() => cleanup());

describe("Switch", () => {
  it("renders a role=switch button with aria-checked reflecting checked", () => {
    render(<Switch checked onChange={vi.fn()} />);
    const sw = screen.getByRole("switch");
    expect(sw).toBeInTheDocument();
    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("reflects unchecked state", () => {
    render(<Switch checked={false} onChange={vi.fn()} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("toggles onChange on click", () => {
    const onChange = vi.fn();
    render(<Switch checked onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledTimes(1);
    // checked -> on click it requests the opposite value
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("calls onChange with true when currently unchecked", () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("positions the knob for the on state", () => {
    const { container } = render(<Switch checked onChange={vi.fn()} />);
    const knob = container.querySelector("span");
    expect(knob).not.toBeNull();
    expect(knob!.className).toContain("translate-x-6");
  });

  it("positions the knob for the off state", () => {
    const { container } = render(<Switch checked={false} onChange={vi.fn()} />);
    const knob = container.querySelector("span");
    expect(knob).not.toBeNull();
    expect(knob!.className).toContain("translate-x-1");
  });
});
