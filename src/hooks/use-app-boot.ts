import { useEffect, useState } from "react";
import { ANALYTICS } from "@/constants/analytics";
import { logInfo } from "@/lib/analytics/otel";
import { trackEvent } from "@/lib/analytics/track";

/**
 * Boots async dependencies (OTEL telemetry) and returns true once ready.
 * Cancel-safe: unmounting before boot finishes never flips ready.
 */
export function useAppBoot(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (ANALYTICS.otelUrl) {
          const { initTelemetry } = await import("@/lib/analytics/telemetry");
          initTelemetry();
        }
      } catch {
        /* telemetry failure is non-fatal */
      }
      if (!active) return;
      trackEvent("page_loaded");
      logInfo("app booted", { version: import.meta.env.VITE_APP_VERSION ?? "" });
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  return ready;
}
