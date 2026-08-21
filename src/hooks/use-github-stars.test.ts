import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGithubStars } from "@/hooks/use-github-stars";

const fetchMock = vi.fn();

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("useGithubStars", () => {
  it("fetches stars once and returns them", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ stargazers_count: 42 }) });
    const { result } = renderHook(() => useGithubStars());
    expect(result.current).toBeNull();
    await vi.waitFor(() => expect(result.current).toBe(42));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.github.com/repos/dimasbaguspm/syntaxdiff");
  });

  it("returns null when the fetch fails", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useGithubStars());
    await vi.waitFor(() => expect(result.current).toBeNull());
  });
});
