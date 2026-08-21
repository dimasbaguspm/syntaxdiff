import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { useStore } from "@/core/store";
import { db, listDiffs } from "@/core/db";
import { ComparePage } from "@/pages/compare-page";

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderCompare() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<ComparePage />} />
        <Route path="/diff/:id" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>,
  );
}

const initial = useStore.getState();

beforeEach(async () => {
  useStore.setState(initial, true);
  await db.diffs.clear();
});

afterEach(() => cleanup());

describe("ComparePage", () => {
  it("renders Source A and Source B editable label inputs", () => {
    renderCompare();
    expect(screen.getByDisplayValue("Source A")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Source B")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Paste source A, or drop a file…")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Paste source B, or drop a file…")).toBeInTheDocument();
  });

  it("editing a source label updates the store and persists to the saved record", async () => {
    useStore.setState({
      a: '{"name":"M","age":30}',
      b: '{"name":"M","age":31}',
      lang: "json",
      opts: { sortKeys: true },
    });
    renderCompare();
    const inputA = screen.getByDisplayValue("Source A") as HTMLInputElement;
    fireEvent.change(inputA, { target: { value: "Old config" } });
    expect(useStore.getState().labelA).toBe("Old config");

    const button = screen.getByRole("button", { name: /Compare/ });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toMatch(/^\/diff\/[0-9a-f-]+$/);
    });
    const saved = await listDiffs();
    expect(saved[0].labelA).toBe("Old config");
  });

  it("typing updates the store", () => {
    renderCompare();
    fireEvent.change(screen.getByPlaceholderText("Paste source A, or drop a file…"), {
      target: { value: "alpha" },
    });
    fireEvent.change(screen.getByPlaceholderText("Paste source B, or drop a file…"), {
      target: { value: "beta" },
    });
    expect(useStore.getState().a).toBe("alpha");
    expect(useStore.getState().b).toBe("beta");
  });

  it("clicking Compare saves to the db and navigates to /diff/:id", async () => {
    useStore.setState({
      a: '{"name":"M","age":30}',
      b: '{"name":"M","age":31}',
      lang: "json",
      opts: { sortKeys: true },
    });
    renderCompare();
    const button = screen.getByRole("button", { name: /Compare/ });
    expect(button).toBeEnabled();
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toMatch(/^\/diff\/[0-9a-f-]+$/);
    });

    const saved = await listDiffs();
    expect(saved.length).toBe(1);
    expect(saved[0].lang).toBe("json");
    expect(saved[0].a).toBe('{"name":"M","age":30}');
  });

  it("Compare button is disabled when either textarea is empty", () => {
    useStore.setState({ a: "", b: "" });
    renderCompare();
    expect(screen.getByRole("button", { name: /Compare/ })).toBeDisabled();
  });

  it("opens the Options modal with the language toggles", () => {
    useStore.setState({ a: '{"x":1}', b: '{"x":2}', lang: "json" });
    renderCompare();
    fireEvent.click(screen.getByRole("button", { name: /Options/i }));
    expect(screen.getByText("Options — JSON")).toBeInTheDocument();
    expect(screen.getAllByRole("switch").length).toBeGreaterThan(0);
  });

  it("shows per-pane tools (Validate/Format) for JSON", () => {
    useStore.setState({ a: '{"x":1}', b: '{"x":2}', lang: "json" });
    renderCompare();
    expect(screen.getAllByRole("button", { name: /Validate syntax/i }).length).toBe(2);
    expect(screen.getAllByRole("button", { name: /Format/i }).length).toBe(2);
  });

  it("Validate shows a success snack for valid JSON", () => {
    useStore.setState({ a: '{"x":1}', lang: "json" });
    renderCompare();
    fireEvent.click(screen.getAllByRole("button", { name: /Validate syntax/i })[0]);
    expect(useStore.getState().snack?.type).toBe("success");
    expect(useStore.getState().snack?.message).toContain("Valid JSON");
  });
});
