import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Modal } from "./modal";

afterEach(() => cleanup());

describe("Modal", () => {
  it("renders nothing when closed", () => {
    render(
      <Modal open={false} title="T" onClose={() => {}}>
        content
      </Modal>,
    );
    expect(screen.queryByText("content")).toBeNull();
  });

  it("renders the title and children when open", () => {
    render(
      <Modal open title="Options" onClose={() => {}}>
        <span>inside</span>
      </Modal>,
    );
    expect(screen.getByText("Options")).toBeInTheDocument();
    expect(screen.getByText("inside")).toBeInTheDocument();
  });

  it("close button calls onClose", () => {
    const onClose = vi.fn();
    render(
      <Modal open title="T" onClose={onClose}>
        <span>inside</span>
      </Modal>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
