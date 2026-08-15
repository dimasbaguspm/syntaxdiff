import { deserialize } from "bson";
import { ParseError } from "../types";
import type { FormatOptions, LanguageAdapter } from "../types";
import { canonicalize } from "../canonical";

/**
 * BSON is binary, so a textarea can't hold raw bytes. MVP scaffold accepts
 * base64 and decodes it. The real phase reads an ArrayBuffer via FileReader
 * and feeds the same Uint8Array into `deserialize`.
 *
 * Decoding uses global `atob` (available in browsers and Node >=16) so this
 * adapter runs unchanged in the Web Worker and in vitest.
 */
function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export const bsonAdapter: LanguageAdapter = {
  id: "bson",
  label: "BSON",
  detect(input: string): number {
    const t = input.trim();
    // Base64-ish and long enough to plausibly be binary data.
    if (t.length > 20 && /^[A-Za-z0-9+/=]+$/.test(t)) return 0.5;
    return 0;
  },
  toggles: [{ id: "sortKeys", label: "Alphabetize keys (recursive)" }],
  format(input: string, opts: FormatOptions) {
    let bytes: Uint8Array;
    try {
      bytes = base64ToBytes(input.trim());
    } catch (e) {
      throw new ParseError(`Invalid base64 BSON: ${(e as Error).message}`);
    }
    try {
      const v = deserialize(bytes);
      const canonical = canonicalize(v, opts.sortKeys === true);
      return { canonical: JSON.stringify(canonical, null, 2) };
    } catch (e) {
      throw new ParseError(`Invalid BSON: ${(e as Error).message}`);
    }
  },
};
