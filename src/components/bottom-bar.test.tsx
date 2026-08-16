import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BottomBar } from "./bottom-bar";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stargazers_count: 12 }) }),
  );
});

describe("BottomBar", () => {
  it("calls onOpenHistory when the history button is clicked", () => {
    const onOpenHistory = vi.fn();
    render(<BottomBar onOpenHistory={onOpenHistory} />);
    fireEvent.click(screen.getByRole("button", { name: "History" }));
    expect(onOpenHistory).toHaveBeenCalledTimes(1);
  });

  it("shows the site name", () => {
    render(<BottomBar onOpenHistory={vi.fn()} />);
    expect(screen.getByText("syntaxdiff.dimasbaguspm.dev")).toBeInTheDocument();
  });

  it("has a theme toggle button", () => {
    render(<BottomBar onOpenHistory={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeInTheDocument();
  });

  it("toggles the theme class on the document element", () => {
    document.documentElement.classList.remove("light");
    render(<BottomBar onOpenHistory={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("has a mobile More menu button", () => {
    render(<BottomBar onOpenHistory={vi.fn()} />);
    expect(screen.getByRole("button", { name: "More" })).toBeInTheDocument();
  });

  it("links to the GitHub repo with the star count", async () => {
    render(<BottomBar onOpenHistory={vi.fn()} />);
    const link = screen.getByLabelText("GitHub");
    expect(link).toHaveAttribute("href", "https://github.com/dimasbaguspm/syntaxdiff");
    expect(link).toHaveAttribute("target", "_blank");
    expect(await screen.findByText("12")).toBeInTheDocument();
  });

  it("opens the Help modal with numbered steps", () => {
    render(<BottomBar onOpenHistory={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Help" }));
    expect(screen.getByText("How to use SyntaxDiff")).toBeInTheDocument();
    expect(screen.getByText("Paste Source A and Source B into the two panes.")).toBeInTheDocument();
  });

  it("links to the Feedback issue tracker", () => {
    render(<BottomBar onOpenHistory={vi.fn()} />);
    const link = screen.getByText("Feedback").closest("a");
    expect(link).toHaveAttribute("href", "https://github.com/dimasbaguspm/syntaxdiff/issues");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
