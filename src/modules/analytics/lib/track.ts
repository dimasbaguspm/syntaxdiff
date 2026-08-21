import { ANALYTICS } from "@/utils/analytics-config";
import { APP_VERSION } from "@/utils/version";
import { getSession } from "@/utils/session";
import { maskUrl } from "@/utils/mask";
import { getBrowserInfo } from "@/utils/browser";
import { loadUmami } from "@/modules/analytics/lib/load-umami";
import { trackUmami, umamiVersion } from "@/modules/analytics/lib/umami";
import { ANALYTICS_PROVIDER } from "@/modules/analytics/providers/provider";

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
    appVersion: APP_VERSION,
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
