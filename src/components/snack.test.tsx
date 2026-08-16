import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useStore } from "../store";
import { Snack } from "./snack";

const initial = useStore.getState();

beforeEach(() => {
  useStore.setState(initial, true);
});

afterEach(() => cleanup());

describe("Snack", () => {
  it("renders nothing when there is no snack", () => {
    render(<Snack />);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("renders the message and dismisses on close", () => {
    useStore.getState().showSnack("hello there", "success");
    render(<Snack />);
    expect(screen.getByText("hello there")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Dismiss/i }));
    expect(useStore.getState().snack).toBeNull();
  });

  it("persists until dismissed (no auto-hide)", () => {
    useStore.getState().showSnack("persisted", "error");
    render(<Snack />);
    expect(screen.getByText("persisted")).toBeInTheDocument();
  });
});
