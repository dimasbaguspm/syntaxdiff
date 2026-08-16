import { describe, expect, it } from "vitest";
import { FEEDBACK_URL, GITHUB_URL, SITE_URL } from "./misc";

describe("constants", () => {
  it("GITHUB_URL points at the syntaxdiff repo", () => {
    expect(GITHUB_URL).toBe("https://github.com/dimasbaguspm/syntaxdiff");
  });

  it("SITE_URL points at the deployment", () => {
    expect(SITE_URL).toBe("https://syntaxdiff.dimasbaguspm.dev");
  });

  it("FEEDBACK_URL is the GitHub new-issue link", () => {
    expect(FEEDBACK_URL).toBe(`${GITHUB_URL}/issues/new`);
  });
});
