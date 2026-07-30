/**
 * Linear barcode rendering.
 *
 * Separate from qr.ts on purpose — bwip-js is ~1.2MB and must only reach the
 * one tool that uses it. See the note in qr.ts.
 */

// Explicitly the browser entry. The bare "bwip-js" specifier resolves through
// a `browser` export condition that Vite honours but TypeScript's bundler
// resolution does not — TS would pick the Node typings, which expose
// toBuffer() instead of toCanvas() and fail to compile.
import bwipjs from "bwip-js/browser";

export interface BarcodeSymbology {
  /** bwip-js identifier. */
  id: string;
  label: string;
  /** Shown under the input as a format hint. */
  hint: string;
  /** Validates before render, so the user gets a useful message instead of a throw. */
  validate?: (value: string) => string | null;
}

const digitsOnly =
  (length: number) =>
  (value: string): string | null => {
    if (!/^\d+$/.test(value)) return "Digits only.";
    if (value.length !== length) return `Needs exactly ${length} digits (you have ${value.length}).`;
    return null;
  };

export const SYMBOLOGIES: BarcodeSymbology[] = [
  {
    id: "code128",
    label: "Code 128",
    hint: "Any ASCII text. The general-purpose choice for internal labels.",
  },
  {
    id: "code39",
    label: "Code 39",
    hint: "A-Z, 0-9, and - . $ / + % space.",
    validate: (v) => (/^[0-9A-Z\-.$/+% ]+$/.test(v) ? null : "Only A-Z, 0-9 and - . $ / + % space."),
  },
  {
    id: "ean13",
    label: "EAN-13",
    hint: "12 digits — the 13th check digit is calculated for you.",
    validate: digitsOnly(12),
  },
  {
    id: "ean8",
    label: "EAN-8",
    hint: "7 digits — the check digit is calculated for you.",
    validate: digitsOnly(7),
  },
  {
    id: "upca",
    label: "UPC-A",
    hint: "11 digits — the check digit is calculated for you.",
    validate: digitsOnly(11),
  },
  {
    id: "itf14",
    label: "ITF-14",
    hint: "13 digits — shipping-container symbology.",
    validate: digitsOnly(13),
  },
];

export interface BarcodeOptions {
  scale?: number;
  height?: number;
  includeText?: boolean;
}

export function renderBarcodeToCanvas(
  canvas: HTMLCanvasElement,
  symbologyId: string,
  text: string,
  options: BarcodeOptions = {},
): void {
  const { scale = 3, height = 12, includeText = true } = options;
  // bwip-js throws a plain Error with a "bwipp." prefixed message; the caller
  // catches and surfaces it, but validate() should have caught the common cases first.
  bwipjs.toCanvas(canvas, {
    bcid: symbologyId,
    text,
    scale,
    height,
    includetext: includeText,
    textxalign: "center",
  });
}

export function findSymbology(id: string): BarcodeSymbology | undefined {
  return SYMBOLOGIES.find((s) => s.id === id);
}
