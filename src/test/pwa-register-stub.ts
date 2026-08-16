/**
 * Stub for the `virtual:pwa-register` module, aliased only under vitest.
 * The PWA service worker does not exist in jsdom, so registration is a no-op
 * that never fires callbacks and returns a no-op updater.
 */
export function registerSW(): () => Promise<void> {
  return () => Promise.resolve();
}
