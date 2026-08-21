import { useCallback, useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics/track";

type UpdateSW = ((reloadPage?: boolean) => Promise<void>) | null;

/**
 * PWA update coordination. Registers the service worker (lazy-loaded so the
 * hook stays inert in dev/tests where the virtual module is absent) and
 * surfaces a `needRefresh` flag when a new version is available, so the UI
 * can prompt the user to update. All transitions are tracked.
 */
export function usePwaUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateSW, setUpdateSW] = useState<UpdateSW>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      let registerSW:
        | ((options?: {
            immediate?: boolean;
            onNeedRefresh?: () => void;
            onOfflineReady?: () => void;
          }) => Promise<UpdateSW> | UpdateSW)
        | undefined;
      try {
        const mod = await import("virtual:pwa-register");
        registerSW = mod.registerSW;
      } catch {
        registerSW = undefined; // dev / tests: no service worker
      }
      if (cancelled || !registerSW) return;

      const updater = registerSW({
        immediate: true,
        onNeedRefresh() {
          if (cancelled) return;
          setNeedRefresh(true);
          trackEvent("pwa_update_available");
        },
        onOfflineReady() {
          if (cancelled) return;
          setOfflineReady(true);
          trackEvent("pwa_offline_ready");
        },
      });
      const resolved = await updater;
      if (!cancelled) setUpdateSW(() => resolved);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const acceptUpdate = useCallback(() => {
    trackEvent("pwa_update_accepted");
    void updateSW?.(true); // reloadPage = true → reload to the new version
  }, [updateSW]);

  const dismiss = useCallback(() => {
    setNeedRefresh(false);
    trackEvent("pwa_update_dismissed");
  }, []);

  const dismissOffline = useCallback(() => setOfflineReady(false), []);

  return { needRefresh, offlineReady, acceptUpdate, dismiss, dismissOffline };
}
