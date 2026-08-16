import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { jsonAdapter } from "../engine/adapters/json";
import { sqlAdapter } from "../engine/adapters/sql";
import { useStore } from "../store";
import { TogglesPanel } from "./toggles-panel";

const initial = useStore.getState();

beforeEach(() => {
  useStore.setState(initial, true);
});

afterEach(() => cleanup());

describe("TogglesPanel", () => {
  it("renders a checkbox per adapter toggle", () => {
    useStore.setState({ opts: {} });
    render(<TogglesPanel adapter={jsonAdapter} />);
    expect(jsonAdapter.toggles.length).toBeGreaterThan(0);
    for (const t of jsonAdapter.toggles) {
      expect(screen.getByLabelText(t.label)).toBeInTheDocument();
    }
  });

  it("reflects the store opts value on the checkbox", () => {
    useStore.setState({ opts: { prettify: false, minify: true } });
    render(<TogglesPanel adapter={jsonAdapter} />);
    expect(screen.getByLabelText("Prettify")).not.toBeChecked();
    expect(screen.getByLabelText("Minify")).toBeChecked();
    // not in opts -> falls back to default (prettify default true is overridden)
    expect(screen.getByLabelText("Alphabetize keys (recursive)")).not.toBeChecked();
  });

  it("falls back to the toggle default when opts has no entry", () => {
    useStore.setState({ opts: {} });
    render(<TogglesPanel adapter={jsonAdapter} />);
    // prettify defaults to true
    expect(screen.getByLabelText("Prettify")).toBeChecked();
  });

  it("calls setOpt on change and updates the store", () => {
    useStore.setState({ opts: { prettify: false } });
    render(<TogglesPanel adapter={jsonAdapter} />);
    const prettify = screen.getByLabelText("Prettify");
    expect(prettify).not.toBeChecked();
    fireEvent.click(prettify);
    expect(useStore.getState().opts.prettify).toBe(true);
  });

  it("renders a dialect dropdown for SQL and updates the store", () => {
    useStore.setState({ opts: {} });
    render(<TogglesPanel adapter={sqlAdapter} />);
    const select = screen.getByLabelText("Dialect");
    expect(select.tagName).toBe("SELECT");
    fireEvent.change(select, { target: { value: "postgresql" } });
    expect(useStore.getState().opts.dialect).toBe("postgresql");
  });

  it("shows a no-options message when the adapter has no toggles", () => {
    const bare = { ...jsonAdapter, toggles: [] };
    render(<TogglesPanel adapter={bare} />);
    expect(screen.getByText("No options for JSON.")).toBeInTheDocument();
  });
});
