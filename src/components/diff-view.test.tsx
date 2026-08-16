import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { DiffView } from "./diff-view";

const PATCH = `--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,3 @@
 line1
-line2
+line2b
 line3
`;

afterEach(() => cleanup());

describe("DiffView", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  it("renders the added and removed counts", () => {
    render(<DiffView patch={PATCH} mode="unified" counts={{ added: 2, removed: 3 }} />);
    expect(screen.getByText("+2 added")).toBeInTheDocument();
    expect(screen.getByText("−3 removed")).toBeInTheDocument();
  });

  it("renders a copy button", () => {
    render(<DiffView patch={PATCH} mode="split" counts={{ added: 1, removed: 1 }} />);
    expect(screen.getByRole("button", { name: /Copy diff/ })).toBeInTheDocument();
  });

  it("renders the diff body container", () => {
    const { container } = render(
      <DiffView patch={PATCH} mode="unified" counts={{ added: 1, removed: 1 }} />,
    );
    expect(container.querySelector(".diff-body")).not.toBeNull();
  });
});
