import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useStore } from "@/core/store";
import { useBaseDiff } from "@/core/stores/use-base-diff";

const initial = useStore.getState();

beforeEach(() => {
  useStore.setState(initial, true);
});

describe("useBaseDiff", () => {
  it("returns side A's slice from the store", () => {
    const { result } = renderHook(() => useBaseDiff("a"));
    expect(result.current.value).toBe("");
    expect(result.current.label).toBe("Source A");
  });

  it("returns side B's slice from the store", () => {
    const { result } = renderHook(() => useBaseDiff("b"));
    expect(result.current.value).toBe("");
    expect(result.current.label).toBe("Source B");
  });

  it("setValue writes the matching store field and resets run state", () => {
    useStore.getState().runSuccess({
      language: "json",
      patch: "@@",
      counts: { added: 0, removed: 0 },
      lines: [],
    });
    const { result } = renderHook(() => useBaseDiff("b"));
    act(() => result.current.setValue("payload"));
    expect(useStore.getState().b).toBe("payload");
    expect(useStore.getState().status).toBe("idle");
    expect(result.current.value).toBe("payload");
  });

  it("setLabel writes the matching label field only", () => {
    const { result } = renderHook(() => useBaseDiff("a"));
    act(() => result.current.setLabel("Prod config"));
    expect(useStore.getState().labelA).toBe("Prod config");
    expect(useStore.getState().labelB).toBe("Source B");
    expect(result.current.label).toBe("Prod config");
  });

  it("keeps sides independent", () => {
    const a = renderHook(() => useBaseDiff("a")).result;
    const b = renderHook(() => useBaseDiff("b")).result;
    act(() => a.current.setValue("left"));
    expect(a.current.value).toBe("left");
    expect(b.current.value).toBe("");
  });

  it("setter references stay stable across renders", () => {
    const { result, rerender } = renderHook(() => useBaseDiff("a"));
    const first = result.current;
    rerender();
    expect(result.current.setValue).toBe(first.setValue);
    expect(result.current.setLabel).toBe(first.setLabel);
  });
});
