import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "./track";

function fakeUmami() {
  const track = vi.fn();
  (window as unknown as { umami: { track: typeof track; version: string } }).umami = {
    track,
    version: "9.9.9",
  };
  return track;
}

describe("trackEvent", () => {
  beforeEach(() => {
    sessionStorage.clear();
    delete (window as unknown as { umami?: unknown }).umami;
  });

  afterEach(() => {
    delete (window as unknown as { umami?: unknown }).umami;
  });

  it("calls window.umami.track with the event name", () => {
    const track = fakeUmami();
    trackEvent("click");
    expect(track).toHaveBeenCalledTimes(1);
    expect(track.mock.calls[0][0]).toBe("click");
  });

  it("enriches attributes with provider metadata and session context", () => {
    const track = fakeUmami();
    trackEvent("copy", { source: "button" });
    const attrs = track.mock.calls[0][1] as Record<string, unknown>;
    expect(attrs.provider).toBe("umami");
    expect(attrs.providerVersion).toBe("9.9.9");
    expect(attrs.environment).toBeDefined();
    expect(typeof attrs.sessionId).toBe("string");
    expect(attrs.source).toBe("button");
    expect(attrs.page).toBeDefined();
    expect(typeof attrs.userAgent).toBe("string");
    expect(typeof attrs.browserName).toBe("string");
    expect(typeof attrs.browserVersion).toBe("string");
  });

  it("merges user attrs over defaults", () => {
    const track = fakeUmami();
    trackEvent("click", { provider: "override", sessionId: "mine" });
    const attrs = track.mock.calls[0][1] as Record<string, unknown>;
    expect(attrs.provider).toBe("override");
    expect(attrs.sessionId).toBe("mine");
  });

  it("is a no-op when no umami tracker is present", () => {
    expect(() => trackEvent("click")).not.toThrow();
  });
});
