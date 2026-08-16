import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LineNumberedTextarea } from "./line-numbered-textarea";

afterEach(() => cleanup());

const renderLnta = (props: Partial<Parameters<typeof LineNumberedTextarea>[0]> = {}) =>
  render(<LineNumberedTextarea value="" onChange={vi.fn()} wrap={false} {...props} />);

describe("LineNumberedTextarea", () => {
  it("renders a textarea", () => {
    renderLnta();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders a gutter with one line number per line", () => {
    const { container } = renderLnta({ value: "a\nb\nc" });
    const gutter = container.querySelector("[aria-hidden]");
    expect(gutter).not.toBeNull();
    const numbers = gutter!.querySelectorAll("div");
    expect(numbers.length).toBe(3);
    expect(numbers[0]).toHaveTextContent("1");
    expect(numbers[1]).toHaveTextContent("2");
    expect(numbers[2]).toHaveTextContent("3");
  });

  it("shows a single line number for an empty or single-line value", () => {
    const { container } = renderLnta({ value: "just one line" });
    expect(container.querySelectorAll("[aria-hidden] div").length).toBe(1);
  });

  it("counts trailing newlines as an extra line", () => {
    const { container } = renderLnta({ value: "a\n" });
    expect(container.querySelectorAll("[aria-hidden] div").length).toBe(2);
  });

  it("calls onChange when the user types", () => {
    const onChange = vi.fn();
    renderLnta({ onChange });
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "x" } });
    expect(onChange).toHaveBeenCalledWith("x");
  });

  it("uses whitespace-pre-wrap when wrap is true", () => {
    const { container } = renderLnta({ wrap: true });
    const ta = container.querySelector("textarea")!;
    expect(ta.className).toContain("whitespace-pre-wrap");
  });

  it("uses whitespace-pre when wrap is false", () => {
    const { container } = renderLnta({ wrap: false });
    const ta = container.querySelector("textarea")!;
    expect(ta.className).toContain("whitespace-pre");
    expect(ta.className).not.toContain("whitespace-pre-wrap");
  });
});
