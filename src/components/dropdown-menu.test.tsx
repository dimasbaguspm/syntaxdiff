import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DropdownMenu, MenuItem } from "./dropdown-menu";

afterEach(() => cleanup());

describe("DropdownMenu", () => {
  it("opens on trigger click and shows menu items", () => {
    render(
      <DropdownMenu label="More" trigger={<span>⋮</span>}>
        <MenuItem onClick={() => {}}>Feedback</MenuItem>
      </DropdownMenu>,
    );
    expect(screen.queryByRole("menu")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Feedback" })).toBeInTheDocument();
  });

  it("closes when the trigger is clicked again", () => {
    render(
      <DropdownMenu label="More" trigger={<span>⋮</span>}>
        <MenuItem onClick={() => {}}>Feedback</MenuItem>
      </DropdownMenu>,
    );
    const btn = screen.getByRole("button", { name: "More" });
    fireEvent.click(btn);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.click(btn);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("closes on Escape", () => {
    render(
      <DropdownMenu label="More" trigger={<span>⋮</span>}>
        <MenuItem onClick={() => {}}>Feedback</MenuItem>
      </DropdownMenu>,
    );
    fireEvent.click(screen.getByRole("button", { name: "More" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
