import { describe, expect, it } from "vitest";
import { initTelemetry, __telemetryReset } from "./telemetry";

describe("initTelemetry", () => {
  it("is a no-op when no url is provided", () => {
    __telemetryReset();
    expect(() => initTelemetry(undefined)).not.toThrow();
  });

  it("is a no-op when url is empty string", () => {
    __telemetryReset();
    expect(() => initTelemetry("")).not.toThrow();
  });
});
