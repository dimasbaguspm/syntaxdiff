import { describe, expect, it } from "vitest";
import { ANALYTICS_PROVIDER } from "@/modules/analytics/providers/provider";

describe("ANALYTICS_PROVIDER", () => {
  it("is set to umami", () => {
    expect(ANALYTICS_PROVIDER).toBe("umami");
  });
});
