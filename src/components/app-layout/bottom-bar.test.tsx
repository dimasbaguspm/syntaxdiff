import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { BottomBar } from "@/components/app-layout/bottom-bar";

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.search}</div>;
}

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
  it("navigates to ?drawerId=history when the history button is clicked", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <BottomBar />
        <LocationDisplay />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "History" }));
    expect(screen.getByTestId("location").textContent).toContain("drawerId=history");
  });

  it("shows the site name", () => {
    render(
      <MemoryRouter>
        <BottomBar />
      </MemoryRouter>,
    );
    expect(screen.getByText("syntaxdiff.dimasbaguspm.dev")).toBeInTheDocument();
  });

  it("has a theme toggle button", () => {
    render(
      <MemoryRouter>
        <BottomBar />
      </MemoryRouter>,
    );
    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeInTheDocument();
  });

  it("toggles the theme class on the document element", () => {
    document.documentElement.classList.remove("light");
    render(
      <MemoryRouter>
        <BottomBar />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("has a mobile More menu button", () => {
    render(
      <MemoryRouter>
        <BottomBar />
      </MemoryRouter>,
    );
    expect(screen.getByRole("button", { name: "More" })).toBeInTheDocument();
  });

  it("links to the GitHub repo with the star count", async () => {
    render(
      <MemoryRouter>
        <BottomBar />
      </MemoryRouter>,
    );
    const link = screen.getByLabelText("GitHub");
    expect(link).toHaveAttribute("href", "https://github.com/dimasbaguspm/syntaxdiff");
    expect(link).toHaveAttribute("target", "_blank");
    expect(await screen.findByText("12")).toBeInTheDocument();
  });

  it("navigates to ?modal=help when Help is clicked", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <BottomBar />
        <LocationDisplay />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Help" }));
    expect(screen.getByTestId("location").textContent).toContain("modal=help");
  });

  it("navigates to ?modal=changelog when Changelog is clicked", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <BottomBar />
        <LocationDisplay />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Changelog" }));
    expect(screen.getByTestId("location").textContent).toContain("modal=changelog");
  });

  it("shows the app version badge", () => {
    render(
      <MemoryRouter>
        <BottomBar />
      </MemoryRouter>,
    );
    expect(screen.getByText(/v(Nightly|0\.1\.0)/)).toBeInTheDocument();
  });

  it("links to the Feedback issue tracker", () => {
    render(
      <MemoryRouter>
        <BottomBar />
      </MemoryRouter>,
    );
    const link = screen.getByText("Feedback").closest("a");
    expect(link).toHaveAttribute("href", "https://github.com/dimasbaguspm/syntaxdiff/issues");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
