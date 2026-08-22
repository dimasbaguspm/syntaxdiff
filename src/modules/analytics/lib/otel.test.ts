import { afterEach, describe, expect, it, vi } from "vitest";
import {
  currentTrace,
  logDebug,
  logError,
  logInfo,
  logWarn,
  __drain,
  __flush,
  __queueLength,
} from "@/modules/analytics/lib/otel";

/**
 * ANALYTICS.otelUrl is undefined in the default test env (VITE_OTEL_COLLECTOR_URL
 * is unset), so postOtlpLog short-circuits before any fetch/network call. The
 * key contract is: none of the log helpers throw when tracing is unconfigured,
 * and they enqueue for the batched sender instead of dispatching immediately.
 */
describe("otel logging helpers", () => {
  afterEach(() => {
    __drain();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

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

describe("batched telemetry sender", () => {
  afterEach(() => {
    __drain();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("enqueues instead of dispatching immediately", () => {
    // No collector configured: helpers must NOT throw, but must enqueue.
    logInfo("a");
    logWarn("b");
    logError(new Error("x"), "c");
    expect(__queueLength()).toBe(3);
  });

  it("flushes the whole queue as ONE batched request", async () => {
    vi.stubEnv("VITE_OTEL_COLLECTOR_URL", "http://localhost:4318");
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchSpy);

    for (let i = 0; i < 5; i++) logInfo(`msg-${i}`);

    await __flush();

    // Exactly one network call for the whole batch.
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, { body: string }];
    expect(url).toBe("http://localhost:4318/v1/logs");
    const payload = JSON.parse(init.body);
    const records = payload.resourceLogs[0].scopeLogs[0].logRecords;
    expect(records).toHaveLength(5);
    expect(records[0].body.stringValue).toBe("msg-0");
    expect(__queueLength()).toBe(0);
  });

  it("caps the batch and flushes once the queue reaches the cap", async () => {
    vi.stubEnv("VITE_OTEL_COLLECTOR_URL", "http://localhost:4318");
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchSpy);

    // Enqueue 20 (the cap) — the 20th triggers an immediate auto-flush.
    for (let i = 0; i < 20; i++) logInfo(`m-${i}`);
    // The auto-flush fires synchronously inside enqueue before returning.
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse((fetchSpy.mock.calls[0][1] as { body: string }).body);
    expect(payload.resourceLogs[0].scopeLogs[0].logRecords).toHaveLength(20);
  });
});
