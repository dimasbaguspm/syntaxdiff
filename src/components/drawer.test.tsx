import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Drawer } from "./drawer";

afterEach(() => cleanup());

describe("Drawer", () => {
  it("renders nothing when closed", () => {
    render(
      <Drawer open={false} title="History" onClose={vi.fn()}>
        <div>content</div>
      </Drawer>,
    );
    expect(screen.queryByText("content")).toBeNull();
    expect(screen.queryByText("History")).toBeNull();
  });

  it("renders children and title when open", () => {
    render(
      <Drawer open title="History" onClose={vi.fn()}>
        <div>content</div>
      </Drawer>,
    );
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Drawer open title="History" onClose={onClose}>
        <div>content</div>
      </Drawer>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the backdrop is clicked", () => {
    const onClose = vi.fn();
    render(
      <Drawer open title="History" onClose={onClose}>
        <div>content</div>
      </Drawer>,
    );
    const backdrop = document.querySelector(".bg-black\\/50");
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
