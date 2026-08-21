import { describe, expect, it } from "vitest";
import { maskUrl } from "@/utils/mask";

describe("maskUrl", () => {
  it("masks UUIDs", () => {
    const url = "https://example.com/users/123e4567-e89b-12d3-a456-426614174000";
    expect(maskUrl(url)).toBe("https://example.com/users/[id]");
  });

  it("masks uppercase UUIDs too", () => {
    const url = "/x/123E4567-E89B-12D3-A456-426614174000";
    expect(maskUrl(url)).toBe("/x/[id]");
  });

  it("masks the /diff/:numeric-id route", () => {
    expect(maskUrl("/diff/42")).toBe("/diff/[id]");
    expect(maskUrl("/diff/1234567890")).toBe("/diff/[id]");
  });

  it("masks a uuid and /diff/:id in one url", () => {
    const url = "https://example.com/u/123e4567-e89b-12d3-a456-426614174000?d=/diff/7";
    const masked = maskUrl(url);
    expect(masked).toContain("[id]");
    expect(masked).not.toContain("426614174000");
    expect(masked).not.toContain("/diff/7");
  });

  it("masks any /diff/:id segment, uuid or slug", () => {
    expect(maskUrl("/diff/42")).toBe("/diff/[id]");
    expect(maskUrl("/diff/123e4567-e89b-12d3-a456-426614174000")).toBe("/diff/[id]");
    expect(maskUrl("/diff/arbitrary-slug")).toBe("/diff/[id]");
  });

  it("leaves ordinary urls untouched", () => {
    expect(maskUrl("https://example.com/path/to/page")).toBe("https://example.com/path/to/page");
  });

  it("handles empty input", () => {
    expect(maskUrl("")).toBe("");
  });
});
