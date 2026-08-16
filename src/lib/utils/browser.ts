import { UAParser } from "ua-parser-js";

export interface BrowserInfo {
  userAgent: string;
  browserName: string;
  browserVersion: string;
}

let cached: BrowserInfo | null = null;

/** Parse the browser once: name + version + raw user agent for telemetry. */
export function getBrowserInfo(): BrowserInfo {
  if (cached) return cached;
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  if (!userAgent) {
    cached = { userAgent: "", browserName: "", browserVersion: "" };
    return cached;
  }
  const ua = new UAParser(userAgent);
  cached = {
    userAgent,
    browserName: ua.getBrowser().name ?? "",
    browserVersion: ua.getBrowser().version ?? "",
  };
  return cached;
}
