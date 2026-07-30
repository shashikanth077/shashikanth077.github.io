/**
 * Base64 / Base64URL / percent-encoding primitives.
 *
 * Everything here is UTF-8 correct. The naive `btoa(str)` throws on any
 * character above U+00FF, so text is always routed through TextEncoder first.
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

function bytesToBinaryString(bytes: Uint8Array): string {
  // Chunked to avoid blowing the argument limit on large inputs.
  const CHUNK = 0x8000;
  let out = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    out += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return out;
}

function binaryStringToBytes(bin: string): Uint8Array {
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function bytesToBase64(bytes: Uint8Array): string {
  return btoa(bytesToBinaryString(bytes));
}

export function base64ToBytes(b64: string): Uint8Array {
  return binaryStringToBytes(atob(b64));
}

export function encodeBase64(text: string, urlSafe = false): string {
  const b64 = bytesToBase64(encoder.encode(text));
  return urlSafe ? toBase64Url(b64) : b64;
}

/**
 * Decodes standard or URL-safe Base64. Throws a readable Error rather than
 * the browser's opaque InvalidCharacterError.
 */
export function decodeBase64(input: string): string {
  const normalised = fromBase64Url(input.trim());
  let bytes: Uint8Array;
  try {
    bytes = base64ToBytes(normalised);
  } catch {
    throw new Error("Not valid Base64 — check for stray characters or truncation.");
  }
  try {
    return decoder.decode(bytes);
  } catch {
    throw new Error("Decoded successfully, but the bytes are not valid UTF-8 text.");
  }
}

/** Standard Base64 → URL-safe (RFC 4648 §5), padding stripped. */
export function toBase64Url(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** URL-safe Base64 → standard, padding restored. */
export function fromBase64Url(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = b64.length % 4;
  return remainder === 0 ? b64 : b64 + "=".repeat(4 - remainder);
}

export function isProbablyBase64(input: string): boolean {
  const s = input.trim();
  return s.length > 0 && /^[A-Za-z0-9+/\-_]+={0,2}$/.test(s);
}

/* ------------------------------------------------------------------ */
/* Percent-encoding                                                     */
/* ------------------------------------------------------------------ */

export type UrlEncodeMode = "component" | "uri";

/**
 * `component` — encodes reserved characters too (&, =, ?, /). Use for a single
 *               query-parameter value or path segment.
 * `uri`       — leaves reserved characters intact. Use for a whole URL.
 */
export function encodeUrl(text: string, mode: UrlEncodeMode = "component"): string {
  return mode === "component" ? encodeURIComponent(text) : encodeURI(text);
}

export function decodeUrl(text: string, mode: UrlEncodeMode = "component"): string {
  try {
    return mode === "component" ? decodeURIComponent(text) : decodeURI(text);
  } catch {
    throw new Error("Malformed percent-encoding — check for a stray % or an incomplete sequence.");
  }
}

export interface QueryParam {
  key: string;
  value: string;
}

/** Splits a URL or bare query string into its parameters, for the inspector panel. */
export function parseQueryParams(input: string): QueryParam[] {
  const queryStart = input.indexOf("?");
  const query = queryStart >= 0 ? input.slice(queryStart + 1) : input;
  if (!query) return [];
  return Array.from(new URLSearchParams(query).entries()).map(([key, value]) => ({ key, value }));
}
