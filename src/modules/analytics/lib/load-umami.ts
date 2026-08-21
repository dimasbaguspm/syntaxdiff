type UmamiTracker = {
  track: (name: string, props?: Record<string, unknown>) => void;
  version?: string;
};

declare global {
  interface Window {
    umami?: UmamiTracker;
  }
}

/**
 * Inject the Umami script lazily. No-op unless a website id is configured
 * (`VITE_UMAMI_WEBSITE_ID`) and the tracker isn't already present, keeping the
 * app free of analytics beacons by default.
 */
export function loadUmami(websiteId?: string): void {
  if (!websiteId) return;
  if (window.umami) return;
  const script = document.createElement("script");
  script.defer = true;
  script.async = true;
  script.src = "https://analytics.dimasbaguspm.dev/script.js";
  script.setAttribute("data-website-id", websiteId);
  document.head.appendChild(script);
}
