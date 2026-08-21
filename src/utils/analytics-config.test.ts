import { describe, expect, it } from "vitest";
import { ANALYTICS } from "@/utils/analytics-config";

describe("ANALYTICS", () => {
  it("has the expected shape", () => {
    expect(ANALYTICS).toHaveProperty("otelUrl");
    expect(ANALYTICS).toHaveProperty("umamiWebsiteId");
  });

  it("has an undefined otelUrl in the test env (no VITE_OTEL_COLLECTOR_URL)", () => {
    expect(ANALYTICS.otelUrl).toBeUndefined();
  });
});
