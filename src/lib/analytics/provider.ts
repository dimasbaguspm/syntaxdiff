/**
 * The active analytics provider. Consumers only call `trackEvent(name, attrs)`.
 */
export const ANALYTICS_PROVIDER = "umami" as const;

export type AnalyticsProvider = typeof ANALYTICS_PROVIDER;
