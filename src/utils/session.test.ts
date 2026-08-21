import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * session.ts caches SessionInfo in module state and reads sessionStorage /
 * location.search / document.referrer. We reset the module cache between
 * tests so each test gets fresh state, and stub the browser globals.
 */
function setSearch(search: string) {
  // jsdom's location.search is not redefinable; drive it via history.
  // An empty string is treated as a no-op by replaceState, so reset to "/".
  window.history.replaceState(null, "", search === "" ? "/" : search);
}

function setReferrer(referrer: string) {
  Object.defineProperty(document, "referrer", {
    value: referrer,
    configurable: true,
  });
}

async function freshGetSession(): Promise<typeof import("./session").getSession> {
  vi.resetModules();
  const mod = await import("./session");
  return mod.getSession;
}

describe("getSession", () => {
  beforeEach(() => {
    sessionStorage.clear();
    setSearch("");
    setReferrer("");
  });

  it("returns a stable sessionId across calls within a tab", async () => {
    const getSession = await freshGetSession();
    const first = getSession();
    const second = getSession();
    expect(first.sessionId).toBeTruthy();
    expect(second.sessionId).toBe(first.sessionId);
  });

  it("persists the sessionId in sessionStorage", async () => {
    const getSession = await freshGetSession();
    const { sessionId } = getSession();
    expect(sessionStorage.getItem("syntaxdiff:session")).toBe(sessionId);
  });

  it("reuses a pre-existing session id from storage", async () => {
    sessionStorage.setItem("syntaxdiff:session", "existing-id-123");
    const getSession = await freshGetSession();
    expect(getSession().sessionId).toBe("existing-id-123");
  });

  it("captures the referrer", async () => {
    setReferrer("https://other.dev/page");
    const getSession = await freshGetSession();
    expect(getSession().referrer).toBe("https://other.dev/page");
  });

  it("masks ids in the referrer", async () => {
    setReferrer("https://x.dev/u/123e4567-e89b-12d3-a456-426614174000");
    const getSession = await freshGetSession();
    expect(getSession().referrer).toContain("[id]");
    expect(getSession().referrer).not.toContain("426614174000");
  });

  it("collects utm params from the query string", async () => {
    setSearch("?utm_source=twitter&utm_campaign=launch&other=1");
    const getSession = await freshGetSession();
    expect(getSession().utm).toEqual({ utm_source: "twitter", utm_campaign: "launch" });
  });

  it("returns empty utm when no params present", async () => {
    const getSession = await freshGetSession();
    expect(getSession().utm).toEqual({});
  });
});
