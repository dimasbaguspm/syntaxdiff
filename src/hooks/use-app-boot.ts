import { useEffect, useState } from "react";
import { ANALYTICS } from "@/utils/analytics-config";
import { logInfo } from "@/modules/analytics/lib/otel";
import { trackEvent } from "@/modules/analytics/lib/track";

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
          const { initTelemetry } = await import("@/modules/analytics/lib/telemetry");
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
