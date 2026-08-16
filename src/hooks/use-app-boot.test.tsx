import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAppBoot } from "./use-app-boot";

describe("useAppBoot", () => {
  it("returns true once boot has completed", async () => {
    const { result } = renderHook(() => useAppBoot());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("never throws in jsdom (trackEvent/logInfo are safe no-ops)", async () => {
    const { result } = renderHook(() => useAppBoot());
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
    expect(result.current).toBe(true);
  });
});
