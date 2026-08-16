import { describe, expect, it } from "vitest";
import { currentTrace, logDebug, logError, logInfo, logWarn } from "./otel";

/**
 * ANALYTICS.otelUrl is undefined in the test env (VITE_OTEL_COLLECTOR_URL is
 * unset), so postOtlpLog short-circuits before any fetch/network call. The
 * key contract is: none of the log helpers throw when tracing is unconfigured.
 */
describe("otel logging helpers", () => {
  it("logInfo does not throw when otelUrl is undefined", () => {
    expect(() => logInfo("hello")).not.toThrow();
  });

  it("logWarn does not throw when otelUrl is undefined", () => {
    expect(() => logWarn("warning")).not.toThrow();
  });

  it("logDebug does not throw when otelUrl is undefined", () => {
    expect(() => logDebug("debug msg")).not.toThrow();
  });

  it("logError does not throw when otelUrl is undefined", () => {
    expect(() => logError(new Error("boom"), "failed")).not.toThrow();
    expect(() => logError("string error", "failed")).not.toThrow();
  });
});

describe("currentTrace", () => {
  it("returns null when no span is active", () => {
    expect(currentTrace()).toBeNull();
  });
});
