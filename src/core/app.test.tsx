import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { db } from "@/core/db";
import App from "@/core/app";

beforeEach(async () => {
  await db.diffs.clear();
});

afterEach(() => cleanup());

describe("App", () => {
  it("renders the Compare page after booting past the Spinner", async () => {
    render(<App />);
    // Waits past the async boot spinner and asserts the Compare page content.
    // Source labels are editable inputs (PR #3), so assert on their values.
    expect(await screen.findByDisplayValue("Source A")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Source B")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Compare/ })).toBeInTheDocument();
  });

  it("shows the bottom bar with the site name", async () => {
    render(<App />);
    expect(await screen.findByText("syntaxdiff.dimasbaguspm.dev")).toBeInTheDocument();
  });
});
