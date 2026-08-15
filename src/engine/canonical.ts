/**
 * Recursively normalize a parsed value so structurally-equivalent inputs
 * produce byte-identical output. THE core of "diff structure, not bytes."
 *
 * Rule: object keys may be sorted; ARRAY ORDER IS ALWAYS PRESERVED.
 * Arrays are ordered data — sorting them would fabricate diffs.
 */
export function canonicalize(v: unknown, sortKeys: boolean): unknown {
  if (Array.isArray(v)) {
    return v.map((item) => canonicalize(item, sortKeys));
  }
  if (v !== null && typeof v === "object") {
    const src = v as Record<string, unknown>;
    const keys = Object.keys(src);
    if (sortKeys) keys.sort();
    const out: Record<string, unknown> = {};
    for (const k of keys) {
      out[k] = canonicalize(src[k], sortKeys);
    }
    return out;
  }
  return v;
}
