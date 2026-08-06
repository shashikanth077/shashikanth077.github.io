/**
 * PDF annotation flattening — writes drawn annotations back onto the PDF.
 *
 * Annotations are stored in PDF coordinate space (72pt = 1 inch, bottom-left
 * origin). The React overlay renders them in screen space by multiplying
 * through a scale factor and flipping y. pdf-lib operations here are the
 * reverse — they receive coordinates already in PDF space.
 *
 * Everything here is strictly additive to the page content stream — nothing
 * reads or rewrites existing operators. That is a deliberate safety
 * constraint (see tools/apps/pdf-tools/docs/edit-pdf-design.md §3): pdf-lib
 * has no supported way to mutate an existing content stream's operators, and
 * attempting it risks corrupting the file. Draw-on-top is the only path that
 * can never do that.
 */

import { PDFDocument, StandardFonts, rgb, PDFName, PDFString, type PDFFont, type PDFPage } from "pdf-lib";

export type AnnotationTool =
  | "text"
  | "pen"
  | "highlight"
  | "link"
  | "image"
  | "whiteout"
  | "shape-ellipse"
  | "shape-rectangle"
  | "shape-line"
  | "shape-arrow";

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
  bold?: boolean;
  italic?: boolean;
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

/** Bottom-left-origin box shared by every box-bounded element. */
interface BoxAnnotation extends BaseAnnotation {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageAnnotation extends BoxAnnotation {
  type: "image";
  /** data: URL — kept inline so the annotation is self-contained through undo/redo. */
  dataUrl: string;
  /** "png" | "jpg" — decided once at insert time from the source file. */
  format: "png" | "jpg";
}

export type ShapeKind = "ellipse" | "rectangle" | "line" | "arrow";

export interface ShapeAnnotation extends BoxAnnotation {
  type: "shape";
  kind: ShapeKind;
  strokeColor: string;
  /** null = no fill (Sejda's default for line/arrow; a real option for rect/ellipse). */
  fillColor: string | null;
  strokeWidth: number;
}

export interface LinkAnnotation extends BoxAnnotation {
  type: "link";
  url: string;
}

export interface WhiteoutAnnotation extends BoxAnnotation {
  type: "whiteout";
}

export type Annotation =
  | TextAnnotation
  | PenAnnotation
  | HighlightAnnotation
  | ImageAnnotation
  | ShapeAnnotation
  | LinkAnnotation
  | WhiteoutAnnotation;

/** #RRGGBB -> pdf-lib rgb(). Returns black on malformed input. */
function hexToRgb(hex: string): ReturnType<typeof rgb> {
  const match = /^#?([\da-f]{6})$/i.exec(hex.trim());
  if (!match || !match[1]) return rgb(0, 0, 0);
  const n = parseInt(match[1], 16);
  return rgb(((n >> 16) & 0xff) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255);
}

function drawText(page: PDFPage, ann: TextAnnotation, font: PDFFont): void {
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

function drawHighlight(page: PDFPage, ann: HighlightAnnotation): void {
  page.drawRectangle({
    x: ann.x,
    y: ann.y,
    width: ann.width,
    height: ann.height,
    color: hexToRgb(ann.color),
    opacity: ann.opacity,
  });
}

function drawPen(page: PDFPage, ann: PenAnnotation): void {
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

function drawWhiteout(page: PDFPage, ann: WhiteoutAnnotation): void {
  // Plain opaque white — matches Sejda's own description of the tool
  // ("cover part of the page with a white rectangle"), not a background-color
  // sample. That sampling behavior is reserved for the existing-text
  // patch-and-re-render pipeline (design doc §3), a different feature.
  page.drawRectangle({
    x: ann.x,
    y: ann.y,
    width: ann.width,
    height: ann.height,
    color: rgb(1, 1, 1),
  });
}

async function drawImage(doc: PDFDocument, page: PDFPage, ann: ImageAnnotation): Promise<void> {
  const base64 = ann.dataUrl.slice(ann.dataUrl.indexOf(",") + 1);
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const embedded = ann.format === "png" ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
  page.drawImage(embedded, { x: ann.x, y: ann.y, width: ann.width, height: ann.height });
}

function drawShape(page: PDFPage, ann: ShapeAnnotation): void {
  const stroke = hexToRgb(ann.strokeColor);
  const fill = ann.fillColor ? hexToRgb(ann.fillColor) : undefined;

  if (ann.kind === "rectangle") {
    page.drawRectangle({
      x: ann.x,
      y: ann.y,
      width: ann.width,
      height: ann.height,
      borderColor: stroke,
      borderWidth: ann.strokeWidth,
      color: fill,
    });
    return;
  }

  if (ann.kind === "ellipse") {
    page.drawEllipse({
      x: ann.x + ann.width / 2,
      y: ann.y + ann.height / 2,
      xScale: Math.abs(ann.width) / 2,
      yScale: Math.abs(ann.height) / 2,
      borderColor: stroke,
      borderWidth: ann.strokeWidth,
      color: fill,
    });
    return;
  }

  // Line and arrow both store their two endpoints as the box's opposite corners.
  const start = { x: ann.x, y: ann.y };
  const end = { x: ann.x + ann.width, y: ann.y + ann.height };

  page.drawLine({ start, end, thickness: ann.strokeWidth, color: stroke });

  if (ann.kind === "arrow") {
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const headLength = Math.max(8, ann.strokeWidth * 4);
    const spread = Math.PI / 7;
    const p1 = {
      x: end.x - headLength * Math.cos(angle - spread),
      y: end.y - headLength * Math.sin(angle - spread),
    };
    const p2 = {
      x: end.x - headLength * Math.cos(angle + spread),
      y: end.y - headLength * Math.sin(angle + spread),
    };
    page.drawLine({ start: end, end: p1, thickness: ann.strokeWidth, color: stroke });
    page.drawLine({ start: end, end: p2, thickness: ann.strokeWidth, color: stroke });
  }
}

/**
 * Adds a clickable URI-link annotation. pdf-lib has no high-level API for
 * this (only PDFDocument-level page content drawing), so it is built from
 * the low-level object model — the standard recipe for link annotations.
 */
function addLinkAnnotation(doc: PDFDocument, page: PDFPage, ann: LinkAnnotation): void {
  const linkDict = doc.context.obj({
    Type: "Annot",
    Subtype: "Link",
    Rect: [ann.x, ann.y, ann.x + ann.width, ann.y + ann.height],
    Border: [0, 0, 0],
    A: {
      Type: "Action",
      S: "URI",
      URI: PDFString.of(ann.url),
    },
  });
  const linkRef = doc.context.register(linkDict);

  const existing = page.node.Annots();
  if (existing) {
    existing.push(linkRef);
  } else {
    page.node.set(PDFName.of("Annots"), doc.context.obj([linkRef]));
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

  // Draw order: whiteout first (it must cover original content, not later
  // additions), then highlight (translucent, should sit under ink), then
  // images/shapes, then pen/text on top, links last (position-only, no paint).
  const order: Record<Annotation["type"], number> = {
    whiteout: 0,
    highlight: 1,
    image: 2,
    shape: 3,
    pen: 4,
    text: 5,
    link: 6,
  };
  const sorted = [...annotations].sort((a, b) => order[a.type] - order[b.type]);

  for (const ann of sorted) {
    const page = pages[ann.page - 1];
    if (!page) continue;

    if (ann.type === "text") drawText(page, ann, font);
    else if (ann.type === "highlight") drawHighlight(page, ann);
    else if (ann.type === "pen") drawPen(page, ann);
    else if (ann.type === "whiteout") drawWhiteout(page, ann);
    else if (ann.type === "shape") drawShape(page, ann);
    else if (ann.type === "image") await drawImage(doc, page, ann);
    else if (ann.type === "link") addLinkAnnotation(doc, page, ann);
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
