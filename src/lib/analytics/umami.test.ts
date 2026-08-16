import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { trackUmami, umamiVersion } from "./umami";

const originalWindow = { ...window };

describe("umami", () => {
  beforeEach(() => {
    (window as unknown as { umami?: unknown }).umami = undefined;
  });

  afterEach(() => {
    (window as unknown as { umami?: unknown }).umami = undefined;
  });

  it("calls window.umami.track when the tracker is present", () => {
    const track = vi.fn();
    (window as unknown as { umami: { track: typeof track } }).umami = { track };
    trackUmami("click", { page: "/" });
    expect(track).toHaveBeenCalledWith("click", { page: "/" });
  });

  it("passes no props when none are given", () => {
    const track = vi.fn();
    (window as unknown as { umami: { track: typeof track } }).umami = { track };
    trackUmami("click");
    expect(track).toHaveBeenCalledWith("click", undefined);
  });

  it("is a no-op when window.umami is absent", () => {
    expect(() => trackUmami("click")).not.toThrow();
  });

  it("returns the umami version when present", () => {
    (window as unknown as { umami: { version: string; track: unknown } }).umami = {
      track: vi.fn(),
      version: "2.5.0",
    };
    expect(umamiVersion()).toBe("2.5.0");
  });

  it("returns unknown when no tracker is present", () => {
    expect(umamiVersion()).toBe("unknown");
  });
});

void originalWindow;
