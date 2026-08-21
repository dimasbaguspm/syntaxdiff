import { useStore } from "@/core/store";

/** One source pane of the A/B pair held by the global store. */
export type BaseDiffSide = "a" | "b";

/** Per-side slice of source A/B state, backed by zustand selectors. */
export interface BaseDiffSlice {
  value: string;
  label: string;
  setValue: (v: string) => void;
  setLabel: (v: string) => void;
}

/**
 * Subscribe to one side's source state (`a`/`labelA` or `b`/`labelB`) without
 * duplicating it. Selectors keep re-renders scoped to the chosen side's
 * slices; setter references are stable across renders.
 */
export function useBaseDiff(side: BaseDiffSide): BaseDiffSlice {
  const value = useStore((s) => (side === "a" ? s.a : s.b));
  const label = useStore((s) => (side === "a" ? s.labelA : s.labelB));
  const setValue = useStore((s) => (side === "a" ? s.setA : s.setB));
  const setLabel = useStore((s) => (side === "a" ? s.setLabelA : s.setLabelB));
  return { value, label, setValue, setLabel };
}
