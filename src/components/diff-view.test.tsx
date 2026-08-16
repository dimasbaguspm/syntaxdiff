import { afterEach, describe, expect, it } from "vitest";
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
  it("renders the diff body container", () => {
    const { container } = render(<DiffView patch={PATCH} mode="unified" />);
    expect(container.querySelector(".diff-body")).not.toBeNull();
  });

  it("labels the sides Source A / Source B in split view", () => {
    render(<DiffView patch={PATCH} mode="split" />);
    expect(screen.getByText("Source A")).toBeInTheDocument();
    expect(screen.getByText("Source B")).toBeInTheDocument();
  });

  it("does not show side labels in unified view", () => {
    render(<DiffView patch={PATCH} mode="unified" />);
    expect(screen.queryByText("Source A")).not.toBeInTheDocument();
    expect(screen.queryByText("Source B")).not.toBeInTheDocument();
  });
});
