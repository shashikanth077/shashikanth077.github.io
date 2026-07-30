/** RFC 4122 version 4 UUID generation, backed by the platform CSPRNG. */

export interface UuidFormat {
  uppercase?: boolean;
  /** Wrap in braces: {xxxxxxxx-...} — the Microsoft GUID convention. */
  braces?: boolean;
  /** Strip hyphens: 32 hex characters. */
  compact?: boolean;
}

/** Hard cap so a mistyped count can't lock up the tab. */
export const MAX_UUID_COUNT = 10_000;

function randomUuid(): string {
  // Available in every browser we target; the fallback covers non-secure
  // contexts (plain http), where randomUUID is undefined but getRandomValues works.
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  // Set the version (4) and variant (RFC 4122) bits.
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

export function formatUuid(uuid: string, format: UuidFormat = {}): string {
  let out = uuid;
  if (format.compact) out = out.replace(/-/g, "");
  if (format.uppercase) out = out.toUpperCase();
  if (format.braces) out = `{${out}}`;
  return out;
}

export function generateUuids(count = 1, format: UuidFormat = {}): string[] {
  const safeCount = Math.min(Math.max(Math.trunc(count) || 1, 1), MAX_UUID_COUNT);
  return Array.from({ length: safeCount }, () => formatUuid(randomUuid(), format));
}

const UUID_RE = /^\{?[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}\}?$/i;

export function isValidUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

/** Reads the version nibble out of a well-formed UUID, or null if unreadable. */
export function uuidVersion(value: string): number | null {
  const hex = value.trim().replace(/[{}-]/g, "");
  if (hex.length !== 32) return null;
  const version = Number.parseInt(hex[12] ?? "", 16);
  return Number.isNaN(version) ? null : version;
}
