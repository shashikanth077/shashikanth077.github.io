/**
 * PDF annotation flattening — writes drawn annotations back onto the PDF.
 *
 * Annotations are stored in PDF coordinate space (72pt = 1 inch, bottom-left
 * origin). The React overlay renders them in screen space by multiplying
 * through a scale factor and flipping y. pdf-lib operations here are the
 * reverse — they receive coordinates already in PDF space.
 *
 * Uses only standard PDF fonts (Helvetica) so we never have to embed a
 * user-supplied font, which would be a large runtime dependency.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

export type AnnotationTool = "text" | "pen" | "highlight";

interface BaseAnnotation {
  /** Stable id — used for React keys and selection tracking. */
  id: string;
  /** 1-based page number this annotation belongs to. */
  page: number;
}

export interface TextAnnotation extends BaseAnnotation {
  type: "text";
  /** PDF-space coordinates of the text baseline. */
  x: number;
  y: number;
  text: string;
  fontSize: number;
  /** Hex color like #E8505B. */
  color: string;
}

export interface PenAnnotation extends BaseAnnotation {
  type: "pen";
  /** Points in PDF space, forming a polyline path. */
  points: Array<{ x: number; y: number }>;
  color: string;
  strokeWidth: number;
}

export interface HighlightAnnotation extends BaseAnnotation {
  type: "highlight";
  /** Bottom-left corner in PDF space. */
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
}

export type Annotation = TextAnnotation | PenAnnotation | HighlightAnnotation;

/** #RRGGBB -> pdf-lib rgb(). Returns black on malformed input. */
function hexToRgb(hex: string): ReturnType<typeof rgb> {
  const match = /^#?([\da-f]{6})$/i.exec(hex.trim());
  if (!match || !match[1]) return rgb(0, 0, 0);
  const n = parseInt(match[1], 16);
  return rgb(((n >> 16) & 0xff) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255);
}

function drawText(
  page: ReturnType<PDFDocument["getPages"]>[number],
  ann: TextAnnotation,
  font: PDFFont,
): void {
  // pdf-lib draws text from the baseline. Our y is the top of the text box in
  // PDF space, so shift down by the font ascent to place the baseline correctly.
  const ascent = font.heightAtSize(ann.fontSize, { descender: false });
  page.drawText(ann.text, {
    x: ann.x,
    y: ann.y - ascent,
    size: ann.fontSize,
    color: hexToRgb(ann.color),
    font,
  });
}

function drawHighlight(
  page: ReturnType<PDFDocument["getPages"]>[number],
  ann: HighlightAnnotation,
): void {
  page.drawRectangle({
    x: ann.x,
    y: ann.y,
    width: ann.width,
    height: ann.height,
    color: hexToRgb(ann.color),
    opacity: ann.opacity,
  });
}

function drawPen(
  page: ReturnType<PDFDocument["getPages"]>[number],
  ann: PenAnnotation,
): void {
  if (ann.points.length < 2) return;
  const color = hexToRgb(ann.color);

  // Draw as a series of line segments — pdf-lib's drawSvgPath uses top-left
  // origin and can be fiddly with coordinate transforms. drawLine takes
  // points directly in PDF space, which matches our storage exactly.
  for (let i = 1; i < ann.points.length; i++) {
    const a = ann.points[i - 1];
    const b = ann.points[i];
    if (!a || !b) continue;
    page.drawLine({
      start: { x: a.x, y: a.y },
      end: { x: b.x, y: b.y },
      thickness: ann.strokeWidth,
      color,
    });
  }
}

/**
 * Flattens all annotations onto the PDF and returns the new bytes.
 * Annotations become part of the page content — they are no longer editable
 * as separate objects after this. That is intentional: the output is a
 * finished PDF for sharing, not an editable working copy.
 */
export async function flattenAnnotations(
  bytes: ArrayBuffer,
  annotations: Annotation[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();

  // Sort so highlights render before pen/text on the same page — otherwise a
  // yellow highlight box would cover an underlying stroke.
  const order = { highlight: 0, pen: 1, text: 2 } as const;
  const sorted = [...annotations].sort((a, b) => order[a.type] - order[b.type]);

  for (const ann of sorted) {
    const page = pages[ann.page - 1];
    if (!page) continue;

    if (ann.type === "text") drawText(page, ann, font);
    else if (ann.type === "highlight") drawHighlight(page, ann);
    else if (ann.type === "pen") drawPen(page, ann);
  }

  return doc.save();
}

/**
 * Random-enough id generator without a uuid dependency.
 * IDs are ephemeral (never persisted) so cryptographic uniqueness is overkill.
 */
export function newAnnotationId(): string {
  return `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
