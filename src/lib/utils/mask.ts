const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const DIFF_ROUTE_RE = /\/diff\/[^/?#]+/gi;

/**
 * Mask identifiers in a URL so telemetry never carries unique ids. Handles
 * UUIDs anywhere plus any dynamic segment under `/diff/:id` (numeric or uuid).
 */
export function maskUrl(input: string): string {
  return input.replace(UUID_RE, "[id]").replace(DIFF_ROUTE_RE, "/diff/[id]");
}
