import { beforeEach, describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme } from "@/hooks/use-theme";

const STORAGE_KEY = "syntaxdiff-theme";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("light");
});

describe("useTheme", () => {
  it("defaults to 'dark' when nothing is saved", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
  });

  it("reads a saved theme from localStorage", () => {
    localStorage.setItem(STORAGE_KEY, "light");
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
  });

  it("toggles between light and dark", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");

    act(() => result.current.toggle());
    expect(result.current.theme).toBe("light");

    act(() => result.current.toggle());
    expect(result.current.theme).toBe("dark");
  });

  it("persists the theme to localStorage when toggled", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggle());
    expect(localStorage.getItem(STORAGE_KEY)).toBe("light");
    act(() => result.current.toggle());
    expect(localStorage.getItem(STORAGE_KEY)).toBe("dark");
  });

  it("applies the .light class to <html> when theme is light", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggle());
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });
});
