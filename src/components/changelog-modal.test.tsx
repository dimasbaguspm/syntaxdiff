import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ChangelogModal } from "./changelog-modal";

afterEach(() => cleanup());

describe("ChangelogModal", () => {
  it("renders the changelog title", () => {
    render(<ChangelogModal open onClose={() => {}} />);
    expect(screen.getAllByText("Changelog").length).toBeGreaterThan(0);
  });

  it("searches the markdown and highlights matches", () => {
    const { container } = render(<ChangelogModal open onClose={() => {}} />);
    const input = screen.getByLabelText("Search changelog");
    fireEvent.change(input, { target: { value: "diff" } });
    expect(container.querySelector("mark")).not.toBeNull();
    expect(screen.getByText(/match(es)?/)).toBeInTheDocument();
  });
});
