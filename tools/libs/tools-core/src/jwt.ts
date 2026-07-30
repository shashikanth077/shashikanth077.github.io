/**
 * JWT decoding.
 *
 * Decoding only — this deliberately does NOT verify the signature. Verification
 * needs the issuer's secret or public key, and asking a user to paste a signing
 * secret into a web page would be indefensible. The UI must say so plainly:
 * a decoded token is not a validated token.
 */

import { decodeBase64 } from "./encoding.js";

export interface JwtHeader {
  alg?: string;
  typ?: string;
  kid?: string;
  [key: string]: unknown;
}

export interface JwtPayload {
  [key: string]: unknown;
}

/** A registered claim (RFC 7519 §4.1) resolved into something displayable. */
export interface ResolvedClaim {
  key: string;
  label: string;
  raw: unknown;
  /** Human-readable rendering — absolute date for the time claims. */
  display: string;
}

export interface DecodedJwt {
  header: JwtHeader;
  payload: JwtPayload;
  /** Base64URL signature segment, left encoded — it is bytes, not text. */
  signature: string;
  claims: ResolvedClaim[];
  expiresAt: Date | null;
  issuedAt: Date | null;
  notBefore: Date | null;
  isExpired: boolean;
  /** Non-fatal observations worth surfacing to the user. */
  warnings: string[];
}

const CLAIM_LABELS: Record<string, string> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  exp: "Expires",
  nbf: "Not before",
  iat: "Issued at",
  jti: "JWT ID",
};

const TIME_CLAIMS = new Set(["exp", "nbf", "iat"]);

/** NumericDate (RFC 7519) is seconds since epoch, not milliseconds. */
function numericDateToDate(value: unknown): Date | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const date = new Date(value * 1000);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatClaimValue(key: string, value: unknown): string {
  if (TIME_CLAIMS.has(key)) {
    const date = numericDateToDate(value);
    if (date) return `${date.toLocaleString()} (${value})`;
  }
  if (Array.isArray(value)) return value.join(", ");
  if (value === null) return "null";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function parseSegment(segment: string, which: "header" | "payload"): Record<string, unknown> {
  let json: string;
  try {
    json = decodeBase64(segment);
  } catch {
    throw new Error(`The ${which} segment is not valid Base64URL.`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error(`The ${which} segment decoded, but is not valid JSON.`);
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`The ${which} segment must be a JSON object.`);
  }
  return parsed as Record<string, unknown>;
}

export function decodeJwt(token: string): DecodedJwt {
  const trimmed = token.trim().replace(/^Bearer\s+/i, "");
  if (!trimmed) throw new Error("Paste a token to decode.");

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    throw new Error(
      `A JWT has three dot-separated segments; this has ${parts.length}. ` +
        (parts.length === 5 ? "Five segments means this is a JWE (encrypted), which cannot be decoded without the key." : ""),
    );
  }

  const [headerSeg = "", payloadSeg = "", signature = ""] = parts;
  const header = parseSegment(headerSeg, "header") as JwtHeader;
  const payload = parseSegment(payloadSeg, "payload") as JwtPayload;

  const expiresAt = numericDateToDate(payload["exp"]);
  const issuedAt = numericDateToDate(payload["iat"]);
  const notBefore = numericDateToDate(payload["nbf"]);
  const now = Date.now();

  const warnings: string[] = [];
  if (header.alg === "none") {
    warnings.push('The "alg" header is "none" — this token is unsigned and trivially forgeable.');
  }
  if (!signature && header.alg !== "none") {
    warnings.push("The signature segment is empty, but the header claims the token is signed.");
  }
  if (expiresAt && expiresAt.getTime() < now) {
    warnings.push(`Expired ${expiresAt.toLocaleString()}.`);
  }
  if (notBefore && notBefore.getTime() > now) {
    warnings.push(`Not valid until ${notBefore.toLocaleString()}.`);
  }

  const claims: ResolvedClaim[] = Object.keys(CLAIM_LABELS)
    .filter((key) => key in payload)
    .map((key) => ({
      key,
      label: CLAIM_LABELS[key] ?? key,
      raw: payload[key],
      display: formatClaimValue(key, payload[key]),
    }));

  return {
    header,
    payload,
    signature,
    claims,
    expiresAt,
    issuedAt,
    notBefore,
    isExpired: expiresAt !== null && expiresAt.getTime() < now,
    warnings,
  };
}
