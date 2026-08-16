const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const DIFF_ID_RE = /\/diff\/\d+/gi;

/**
 * Mask identifiers in a URL so telemetry never carries unique ids. Handles
 * both UUIDs and the numeric `/diff/:id` route.
 */
export function maskUrl(input: string): string {
  return input.replace(UUID_RE, "[id]").replace(DIFF_ID_RE, "/diff/[id]");
}
