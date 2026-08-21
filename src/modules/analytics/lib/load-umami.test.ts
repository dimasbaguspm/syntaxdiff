import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadUmami } from "@/modules/analytics/lib/load-umami";

function scripts(): HTMLScriptElement[] {
  return Array.from(document.querySelectorAll("script"));
}

function setUmamiPresent(present: boolean) {
  if (present) {
    (window as unknown as { umami?: unknown }).umami = { track: vi.fn() };
  } else {
    (window as unknown as { umami?: unknown }).umami = undefined;
  }
}

describe("loadUmami", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    setUmamiPresent(false);
  });

  afterEach(() => {
    document.head.innerHTML = "";
    setUmamiPresent(false);
  });

  it("injects a script when a websiteId is given", () => {
    loadUmami("abc-123");
    expect(scripts()).toHaveLength(1);
    const s = scripts()[0];
    expect(s.src).toContain("analytics.dimasbaguspm.dev/script.js");
    expect(s.getAttribute("data-website-id")).toBe("abc-123");
    expect(s.defer).toBe(true);
    expect(s.async).toBe(true);
  });

  it("does not inject a script when websiteId is undefined", () => {
    loadUmami(undefined);
    expect(scripts()).toHaveLength(0);
  });

  it("does not inject a second script once the tracker is loaded", () => {
    // loadUmami's anti-double-inject guard is `window.umami` presence, which
    // becomes true once the injected script loads. Emulate that here.
    loadUmami("abc-123");
    setUmamiPresent(true);
    loadUmami("abc-123");
    expect(scripts()).toHaveLength(1);
  });

  it("does not inject when the tracker is already present", () => {
    setUmamiPresent(true);
    loadUmami("abc-123");
    expect(scripts()).toHaveLength(0);
  });
});
