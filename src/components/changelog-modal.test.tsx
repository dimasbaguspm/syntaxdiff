import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ChangelogModal } from "./changelog-modal";

afterEach(() => cleanup());

describe("ChangelogModal", () => {
  it("renders the changelog title", () => {
    render(<ChangelogModal open onClose={() => {}} />);
    expect(screen.getAllByText("Changelog").length).toBeGreaterThan(0);
  });

  it("shows content when opened from a closed state", () => {
    const { rerender } = render(<ChangelogModal open={false} onClose={() => {}} />);
    expect(screen.queryByText(/Structure-aware diffing/)).toBeNull();
    rerender(<ChangelogModal open onClose={() => {}} />);
    expect(screen.getByText(/Structure-aware diffing/)).toBeInTheDocument();
  });

  it("searches the markdown and highlights matches", () => {
    const { container } = render(<ChangelogModal open onClose={() => {}} />);
    const input = screen.getByLabelText("Search changelog");
    fireEvent.change(input, { target: { value: "diff" } });
    expect(container.querySelector("mark")).not.toBeNull();
    expect(screen.getByText(/match(es)?/)).toBeInTheDocument();
  });

  it("filters by version via the dropdown", () => {
    const { container } = render(<ChangelogModal open onClose={() => {}} />);
    const select = screen.getByLabelText("Filter by version");
    const version = [...select.querySelectorAll("option")].map((o) => o.value).find(Boolean)!;
    fireEvent.change(select, { target: { value: version } });
    const headings = container.querySelectorAll(".changelog-version");
    expect(headings.length).toBe(1);
    expect(headings[0].textContent).toBe(`v${version}`);
  });

  it("filters by source via the dropdown", () => {
    const { container } = render(<ChangelogModal open onClose={() => {}} />);
    const select = screen.getByLabelText("Filter by source");
    const source = [...select.querySelectorAll("option")].map((o) => o.value).find(Boolean)!;
    fireEvent.change(select, { target: { value: source } });
    const headings = container.querySelectorAll(".md-body h4");
    expect(headings.length).toBeGreaterThan(0);
    for (const h of headings) expect(h.textContent).toBe(source);
  });
});
