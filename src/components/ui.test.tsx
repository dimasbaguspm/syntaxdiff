import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CopyButton, ErrorBanner, Spinner } from "./ui";

afterEach(() => cleanup());

describe("Spinner", () => {
  it("renders a spinning element", () => {
    render(<Spinner />);
    expect(document.querySelector(".animate-spin")).not.toBeNull();
  });
});

describe("ErrorBanner", () => {
  it("renders nothing when message is empty", () => {
    render(<ErrorBanner message="" />);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows the message", () => {
    render(<ErrorBanner message="boom" />);
    expect(screen.getByRole("alert")).toHaveTextContent("boom");
  });
});

describe("CopyButton", () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
  });

  it("copies value via navigator.clipboard and shows Copied", async () => {
    render(<CopyButton value="hello" />);
    fireEvent.click(screen.getByRole("button", { name: /Copy/ }));
    await screen.findByText("Copied");
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("uses a custom label", () => {
    render(<CopyButton value="x" label="Copy diff" />);
    expect(screen.getByRole("button", { name: "Copy diff" })).toBeInTheDocument();
  });

  it("does not flip to Copied when the clipboard is unavailable", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    render(<CopyButton value="hello" />);
    fireEvent.click(screen.getByRole("button", { name: /Copy/ }));
    await Promise.resolve();
    await Promise.resolve();
    expect(screen.queryByText("Copied")).toBeNull();
    expect(screen.getByRole("button", { name: /Copy/ })).toBeInTheDocument();
  });
});
