/**
 * JSON escape / unescape helpers for the per-source Escape button.
 */
export function escapeJsonString(input: string): string {
  return JSON.stringify(input);
}

export function unescapeJsonString(input: string): string {
  const t = input.trim();
  try {
    const value = JSON.parse(t) as unknown;
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
  } catch {
    return t;
  }
}

/** Best-effort guess: does this text look like an escaped JSON string literal? */
export function looksEscaped(input: string): boolean {
  const t = input.trim();
  if (t.startsWith('"') && t.endsWith('"')) return true;
  return /\\[nrt"\\/]/.test(input);
}
