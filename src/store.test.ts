import { beforeEach, describe, expect, it } from "vitest";
import { useStore } from "./store";
import type { DiffResult } from "./engine";

const initial = useStore.getState();

beforeEach(() => {
  useStore.setState(initial, true);
});

const sampleResult: DiffResult = {
  language: "json",
  patch: "@@ diff @@",
  counts: { added: 1, removed: 1 },
};

describe("store", () => {
  it("has sane defaults", () => {
    const s = useStore.getState();
    expect(s.a).toBe("");
    expect(s.b).toBe("");
    expect(s.lang).toBe("auto");
    expect(s.opts).toEqual({});
    expect(s.mode).toBe("split");
    expect(s.status).toBe("idle");
    expect(s.result).toBeNull();
    expect(s.snack).toBeNull();
  });

  it("setA updates a and resets status/result", () => {
    useStore.getState().runSuccess(sampleResult);
    useStore.getState().setA("hello");
    const s = useStore.getState();
    expect(s.a).toBe("hello");
    expect(s.status).toBe("idle");
    expect(s.result).toBeNull();
  });

  it("setB updates b and resets status/result", () => {
    useStore.getState().runSuccess(sampleResult);
    useStore.getState().setB("world");
    const s = useStore.getState();
    expect(s.b).toBe("world");
    expect(s.status).toBe("idle");
    expect(s.result).toBeNull();
  });

  it("setLang updates lang and resets status/result", () => {
    useStore.getState().runSuccess(sampleResult);
    useStore.getState().setLang("yaml");
    const s = useStore.getState();
    expect(s.lang).toBe("yaml");
    expect(s.status).toBe("idle");
    expect(s.result).toBeNull();
  });

  it("setOpt merges a toggle option and resets status/result", () => {
    useStore.getState().runSuccess(sampleResult);
    useStore.getState().setOpt("sortKeys", true);
    let s = useStore.getState();
    expect(s.opts.sortKeys).toBe(true);
    expect(s.status).toBe("idle");
    expect(s.result).toBeNull();

    useStore.getState().setOpt("expand", false);
    s = useStore.getState();
    expect(s.opts.sortKeys).toBe(true);
    expect(s.opts.expand).toBe(false);
  });

  it("setMode updates mode without touching status", () => {
    useStore.getState().setMode("unified");
    expect(useStore.getState().mode).toBe("unified");
    expect(useStore.getState().status).toBe("idle");
  });

  it("runStart transitions to running", () => {
    useStore.getState().runStart();
    const s = useStore.getState();
    expect(s.status).toBe("running");
    expect(s.snack).toBeNull();
  });

  it("runSuccess stores the result and clears the snack", () => {
    useStore.getState().runError("boom");
    useStore.getState().runSuccess(sampleResult);
    const s = useStore.getState();
    expect(s.status).toBe("done");
    expect(s.result).toEqual(sampleResult);
    expect(s.snack).toBeNull();
  });

  it("runError sets status error and an error snack", () => {
    useStore.getState().runStart();
    useStore.getState().runError("boom");
    const s = useStore.getState();
    expect(s.status).toBe("error");
    expect(s.snack?.type).toBe("error");
    expect(s.snack?.message).toBe("boom");
  });

  it("showSnack sets a snack of the given type", () => {
    useStore.getState().showSnack("done!", "success");
    const s = useStore.getState();
    expect(s.snack?.message).toBe("done!");
    expect(s.snack?.type).toBe("success");
  });

  it("dismissSnack clears the snack", () => {
    useStore.getState().showSnack("hi");
    useStore.getState().dismissSnack();
    expect(useStore.getState().snack).toBeNull();
  });

  it("input changes do not clear an open snack (persisted)", () => {
    useStore.getState().showSnack("persist", "error");
    useStore.getState().setA("x");
    expect(useStore.getState().snack).not.toBeNull();
  });
});
