import "fake-indexeddb/auto";
import "@testing-library/jest-dom/vitest";
import { Window } from "happy-dom";

/**
 * Node ≥22 defines an experimental `localStorage` global that stays undefined
 * unless `--localstorage-file` is passed. Because the key exists on globalThis,
 * vitest's happy-dom environment skips copying the Window's real localStorage
 * implementation over it, leaving tests without any storage. Detect that case
 * and wire up a genuine happy-dom localStorage explicitly.
 */
if (typeof globalThis.localStorage === "undefined") {
  const localStorage = new Window().localStorage;
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorage,
    configurable: true,
  });
}
