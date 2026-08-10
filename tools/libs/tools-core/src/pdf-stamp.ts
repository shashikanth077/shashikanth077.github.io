/**
 * Shared "draw formatted text on every page" engine for the page-stamping
 * tools — Watermark, Page Numbers, Header & Footer, Bates Numbering. All
 * four turn out to be the same primitive (position some text at a spot on
 * some or all pages) — confirmed by checking Sejda's own tools directly:
 * its "Page Numbers" and "Header & Footer" pages are literally the same
 * underlying editor. Each tool here supplies its own text-formatting logic
 * (a plain string for Watermark, a per-page sequence/roman-numeral/Bates
 * format for the others) and calls the one `stampPages()` engine.
 */

import { PDFDocument, StandardFonts, rgb, degrees, type PDFFont, type PDFPage } from "pdf-lib";
import { parsePageRanges } from "./pdf.js";

export type StampFontFamily = "Helvetica" | "Times" | "Courier";

export type StampPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "center";

export interface StampOptions {
  position: StampPosition;
  fontFamily: StampFontFamily;
  bold?: boolean;
  fontSize: number;
  /** #RRGGBB. */
  color: string;
  /** 0-1, defaults to fully opaque. */
  opacity?: number;
  /** Degrees, counterclockwise, defaults to 0. */
  rotation?: number;
  /** Distance from the page edge in points, defaults to 24 (~1/3 inch). */
  marginPt?: number;
  /** parsePageRanges() spec — omit or blank for every page. */
  pages?: string;
}

function hexToRgb(hex: string): ReturnType<typeof rgb> {
  const match = /^#?([\da-f]{6})$/i.exec(hex.trim());
  if (!match || !match[1]) return rgb(0, 0, 0);
  const n = parseInt(match[1], 16);
  return rgb(((n >> 16) & 0xff) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255);
}

function standardFont(family: StampFontFamily, bold: boolean): StandardFonts {
  if (family === "Times") return bold ? StandardFonts.TimesRomanBold : StandardFonts.TimesRoman;
  if (family === "Courier") return bold ? StandardFonts.CourierBold : StandardFonts.Courier;
  return bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica;
}

/**
 * Places `text` on `page` so `position`'s name matches what it visually
 * looks like regardless of the string's width — e.g. "top-right" keeps its
 * right edge pinned to the margin as the text gets longer or shorter.
 * Rotation (used by Watermark) pivots around that same anchor point, the
 * same simple approach Sejda's own watermark uses (drag-to-reposition
 * aside) — good enough for a diagonal stamp without needing to solve for
 * the rotated bounding box's true center.
 */
function drawStamp(page: PDFPage, text: string, font: PDFFont, opts: StampOptions): void {
  const { width, height } = page.getSize();
  const margin = opts.marginPt ?? 24;
  const textWidth = font.widthOfTextAtSize(text, opts.fontSize);
  const textHeight = font.heightAtSize(opts.fontSize, { descender: false });

  let x: number;
  let y: number;
  switch (opts.position) {
    case "top-left":
      x = margin;
      y = height - margin - textHeight;
      break;
    case "top-center":
      x = (width - textWidth) / 2;
      y = height - margin - textHeight;
      break;
    case "top-right":
      x = width - margin - textWidth;
      y = height - margin - textHeight;
      break;
    case "bottom-left":
      x = margin;
      y = margin;
      break;
    case "bottom-center":
      x = (width - textWidth) / 2;
      y = margin;
      break;
    case "bottom-right":
      x = width - margin - textWidth;
      y = margin;
      break;
    case "center":
      x = (width - textWidth) / 2;
      y = (height - textHeight) / 2;
      break;
  }

  page.drawText(text, {
    x,
    y,
    size: opts.fontSize,
    font,
    color: hexToRgb(opts.color),
    opacity: opts.opacity ?? 1,
    rotate: opts.rotation ? degrees(opts.rotation) : undefined,
  });
}

/**
 * Stamps every selected page. `textFor(sequenceInSelection, totalPagesInDoc)`
 * is called once per selected page — `sequenceInSelection` is 1-based and
 * counts only the pages actually being stamped (so a numbering tool applied
 * to a custom range still starts a clean count), `totalPagesInDoc` is the
 * whole document's page count (for "Page 2 of 45" style formats, where "45"
 * means the document, not the selection). Returning an empty string for a
 * given page skips drawing anything on it.
 */
export async function stampPages(
  bytes: ArrayBuffer,
  textFor: (sequenceInSelection: number, totalPagesInDoc: number) => string,
  style: StampOptions,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPages();
  if (pages.length === 0) throw new Error("This PDF has no pages.");

  const font = await doc.embedFont(standardFont(style.fontFamily, style.bold ?? false));
  const selected = style.pages?.trim() ? parsePageRanges(style.pages, pages.length) : pages.map((_, i) => i);

  for (const [i, pageIndex] of selected.entries()) {
    const page = pages[pageIndex];
    if (!page) continue;
    const text = textFor(i + 1, pages.length);
    if (text) drawStamp(page, text, font, style);
  }

  return doc.save();
}

/** 1 -> "I", 4 -> "IV", 1994 -> "MCMXCIV". Page-number style only needs positive integers. */
export function toRomanNumeral(num: number): string {
  const table: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let n = Math.max(1, Math.round(num));
  let out = "";
  for (const [value, symbol] of table) {
    while (n >= value) {
      out += symbol;
      n -= value;
    }
  }
  return out;
}

export function zeroPad(num: number, digits: number): string {
  const n = Math.max(0, Math.round(num));
  return String(n).padStart(Math.max(0, digits), "0");
}

export type PageNumberFormat = "arabic" | "roman" | "arabic-of-total";

/** Builds the visible text for a Page Numbers stamp, e.g. "Page 3" / "Page III" / "Page 3 of 45". */
export function formatPageNumberText(prefix: string, num: number, totalPages: number, format: PageNumberFormat): string {
  const p = prefix.trim();
  if (format === "roman") return [p, toRomanNumeral(num)].filter(Boolean).join(" ");
  if (format === "arabic-of-total") return [p, `${num} of ${totalPages}`].filter(Boolean).join(" ");
  return [p, String(num)].filter(Boolean).join(" ");
}
