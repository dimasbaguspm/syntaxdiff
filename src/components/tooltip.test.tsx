import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Tooltip } from "@/components/tooltip";

afterEach(() => cleanup());

describe("Tooltip", () => {
  it("renders the children and a tooltip containing the label", () => {
    render(
      <Tooltip label="Copy">
        <button>trigger</button>
      </Tooltip>,
    );
    expect(screen.getByText("trigger")).toBeInTheDocument();
    const tip = screen.getByRole("tooltip");
    expect(tip).toHaveTextContent("Copy");
  });

  it("is hidden by default via opacity-0", () => {
    render(
      <Tooltip label="Copy">
        <button>trigger</button>
      </Tooltip>,
    );
    const tip = screen.getByRole("tooltip");
    expect(tip.className).toContain("opacity-0");
  });
});
