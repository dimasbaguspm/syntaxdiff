type UmamiTracker = {
  track: (name: string, props?: Record<string, unknown>) => void;
  version?: string;
};

/** Send a custom event to the Umami tracker (loaded by `loadUmami`). */
export function trackUmami(name: string, props?: Record<string, unknown>): void {
  const umami = (window as unknown as { umami?: UmamiTracker }).umami;
  umami?.track(name, props);
}

export function umamiVersion(): string {
  return (window as unknown as { umami?: UmamiTracker }).umami?.version ?? "unknown";
}
