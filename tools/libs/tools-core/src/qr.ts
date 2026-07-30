/**
 * QR code rendering.
 *
 * Kept in its own module, separate from barcode.ts, so bundlers emit one chunk
 * per library. Sharing a module made the QR tool download bwip-js (1.2MB) that
 * it never calls.
 */

import QRCode from "qrcode";

/**
 * L=7% damage tolerance, H=30%. Higher correction means a denser code for the
 * same payload, so it needs more physical space to stay scannable.
 */
export type QrErrorCorrection = "L" | "M" | "Q" | "H";

export interface QrOptions {
  size?: number;
  margin?: number;
  errorCorrection?: QrErrorCorrection;
  dark?: string;
  light?: string;
}

const QR_DEFAULTS: Required<QrOptions> = {
  size: 320,
  margin: 2,
  errorCorrection: "M",
  dark: "#000000",
  light: "#ffffff",
};

function qrConfig(options: QrOptions) {
  const merged = { ...QR_DEFAULTS, ...options };
  return {
    width: merged.size,
    margin: merged.margin,
    errorCorrectionLevel: merged.errorCorrection,
    color: { dark: merged.dark, light: merged.light },
  };
}

export async function renderQrToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  options: QrOptions = {},
): Promise<void> {
  await QRCode.toCanvas(canvas, text, qrConfig(options));
}

export async function qrToPngDataUrl(text: string, options: QrOptions = {}): Promise<string> {
  return QRCode.toDataURL(text, { ...qrConfig(options), type: "image/png" });
}

export async function qrToSvg(text: string, options: QrOptions = {}): Promise<string> {
  return QRCode.toString(text, { ...qrConfig(options), type: "svg" });
}

/* ------------------------------------------------------------------ */
/* Structured payloads                                                  */
/* ------------------------------------------------------------------ */

/** Escapes the characters that carry meaning in a WIFI: payload. */
function escapeWifi(value: string): string {
  return value.replace(/([\\;,":])/g, "\\$1");
}

export function wifiPayload(
  ssid: string,
  password: string,
  security: "WPA" | "WEP" | "nopass" = "WPA",
): string {
  const parts = [`S:${escapeWifi(ssid)}`, `T:${security}`];
  if (security !== "nopass") parts.push(`P:${escapeWifi(password)}`);
  return `WIFI:${parts.join(";")};;`;
}

export function vCardPayload(fields: {
  fullName: string;
  organisation?: string;
  phone?: string;
  email?: string;
  url?: string;
}): string {
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${fields.fullName}`];
  if (fields.organisation) lines.push(`ORG:${fields.organisation}`);
  if (fields.phone) lines.push(`TEL:${fields.phone}`);
  if (fields.email) lines.push(`EMAIL:${fields.email}`);
  if (fields.url) lines.push(`URL:${fields.url}`);
  lines.push("END:VCARD");
  return lines.join("\n");
}
