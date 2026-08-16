export const ANALYTICS = {
  otelUrl: import.meta.env.VITE_OTEL_COLLECTOR_URL as string | undefined,
  umamiWebsiteId: import.meta.env.VITE_UMAMI_WEBSITE_ID as string | undefined,
} as const;
