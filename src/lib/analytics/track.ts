import { ANALYTICS } from "@/constants/analytics";
import { getSession } from "@/lib/utils/session";
import { maskUrl } from "@/lib/utils/mask";
import { getBrowserInfo } from "@/lib/utils/browser";
import { loadUmami } from "./load-umami";
import { trackUmami, umamiVersion } from "./umami";
import { ANALYTICS_PROVIDER } from "./provider";

export type TrackAttrs = Record<string, unknown>;

/**
 * Consumer-facing event API: `trackEvent("click", { ...attrs })`.
 * Enriches every event with provider/app/environment metadata before dispatch.
 */
export function trackEvent(name: string, attrs?: TrackAttrs): void {
  const session = getSession();
  const enriched: TrackAttrs = {
    provider: ANALYTICS_PROVIDER,
    providerVersion: umamiVersion(),
    appVersion: import.meta.env.VITE_APP_VERSION ?? "",
    environment: import.meta.env.MODE,
    ...getBrowserInfo(),
    sessionId: session.sessionId,
    referrer: session.referrer,
    ...session.utm,
    page: typeof location !== "undefined" ? maskUrl(location.pathname) : "",
    url: typeof location !== "undefined" ? maskUrl(location.href) : "",
    ...attrs,
  };

  loadUmami(ANALYTICS.umamiWebsiteId);
  trackUmami(name, enriched);
}
