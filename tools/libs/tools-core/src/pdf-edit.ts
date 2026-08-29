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

import {
  PDFDocument,
  StandardFonts,
  rgb,
  degrees,
  PDFName,
  PDFString,
  type PDFFont,
  type PDFForm,
  type PDFPage,
  type PDFRadioGroup,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export type AnnotationTool =
  | "text"
  | "pen"
  | "highlight"
  | "strikeout"
  | "underline"
  | "link"
  | "image"
  | "signature"
  | "whiteout"
  | "shape-ellipse"
  | "shape-rectangle"
  | "shape-line"
  | "shape-arrow"
  | "form-text"
  | "form-multiline"
  | "form-dropdown"
  | "form-checkbox"
  | "form-radio";

interface BaseAnnotation {
  /** Stable id — used for React keys and selection tracking. */
  id: string;
  /** 1-based page number this annotation belongs to. */
  page: number;
}

/** One of pdf-lib's 14 base PDF fonts, e.g. "Times-BoldItalic" — see StandardFonts in pdf-lib and edit-pdf/fontMatch.ts. Defaults to Helvetica when absent. */
export type StandardFontName =
  | "Helvetica"
  | "Helvetica-Bold"
  | "Helvetica-Oblique"
  | "Helvetica-BoldOblique"
  | "Times-Roman"
  | "Times-Bold"
  | "Times-Italic"
  | "Times-BoldItalic"
  | "Courier"
  | "Courier-Bold"
  | "Courier-Oblique"
  | "Courier-BoldOblique";

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
  /** Set when this text was placed by the existing-text patch pipeline (design doc §3) — the font matched from the run it replaces, instead of the default Helvetica every other text box uses. */
  fontFamily?: StandardFontName;
  /** Set when this text was placed by the existing-text patch pipeline — the id of the paired whiteout annotation covering the original glyphs, so the text's own floating toolbar can offer a "background color" control that edits that cover instead of leaving it fixed at whatever color was auto-sampled. */
  coverId?: string;
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
  /** null = no fill (the default for line/arrow; a real option for rect/ellipse). */
  fillColor: string | null;
  strokeWidth: number;
}

export interface LinkAnnotation extends BoxAnnotation {
  type: "link";
  url: string;
}

export interface WhiteoutAnnotation extends BoxAnnotation {
  type: "whiteout";
  /** Hex color like #E8505B — defaults to opaque white when absent. Set by the existing-text patch pipeline (design doc §3) when it samples an actual page background instead of assuming white. */
  color?: string;
}

export interface SignatureAnnotation extends BoxAnnotation {
  type: "signature";
  /** data: URL — drawn strokes, typed style, or an uploaded image, all flattened to one raster/vector source. */
  dataUrl: string;
  format: "png" | "jpg";
}

/** Strike-through or underline over a dragged region — the box-drag equivalent of text-selection markup (see design doc §5, Phase 2 note). */
export interface MarkupAnnotation extends BoxAnnotation {
  type: "strikeout" | "underline";
  color: string;
}

export type FormFieldKind = "text" | "multiline" | "dropdown" | "checkbox" | "radio";

/**
 * A real AcroForm field, not a visual placeholder — pdf-lib has first-class
 * support for creating fillable fields (`doc.getForm().createTextField()`
 * etc.), so this produces an output PDF with genuinely fillable fields that
 * open correctly in Acrobat or any other PDF reader, not just an image of one.
 */
export interface FormFieldAnnotation extends BoxAnnotation {
  type: "form-field";
  kind: FormFieldKind;
  /** Exported AcroForm field name — must be unique within the document. */
  name: string;
  /** Dropdown-only: the option list. */
  options?: string[];
  /** Radio-only: which option this specific widget represents; siblings share `name` as the group name. */
  radioValue?: string;
}

export type Annotation =
  | TextAnnotation
  | PenAnnotation
  | HighlightAnnotation
  | ImageAnnotation
  | ShapeAnnotation
  | LinkAnnotation
  | WhiteoutAnnotation
  | SignatureAnnotation
  | MarkupAnnotation
  | FormFieldAnnotation;

/** #RRGGBB -> pdf-lib rgb(). Returns black on malformed input. */
function hexToRgb(hex: string): ReturnType<typeof rgb> {
  const match = /^#?([\da-f]{6})$/i.exec(hex.trim());
  if (!match || !match[1]) return rgb(0, 0, 0);
  const n = parseInt(match[1], 16);
  return rgb(((n >> 16) & 0xff) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255);
}

/**
 * How far below a text annotation's `y` (the top of its box) the baseline
 * sits, as a fraction of the font size.
 *
 * This has to be ONE number shared by everything that positions text, and
 * it previously was not -- three places each assumed something different.
 * The editor derived a patched run's `y` as `baseline + 0.8 * size`, the
 * on-screen `<text>` drew its baseline at `y - 1.0 * size`, and this
 * exporter used `font.heightAtSize(size, { descender: false })`, about
 * `0.683 * size` for the fonts actually embedded. So the live preview sat
 * `0.317 * size` below the exported result, and text patched over existing
 * content landed `0.117 * size` off the baseline it was replacing
 * (measured at 1.4pt for 12pt text) -- visibly lifted against the lines
 * around it.
 *
 * 0.8 is the ratio the patch pipeline already encodes when it turns a
 * pdf.js run's baseline into a box top (see `renderPagesToImages`), so
 * adopting it here and on screen makes a patched line land exactly on the
 * baseline it replaces, and makes the preview match the exported file.
 */
export const TEXT_ASCENT_RATIO = 0.8;

function drawText(page: PDFPage, ann: TextAnnotation, font: PDFFont): void {
  // pdf-lib draws from the baseline; our `y` is the top of the text box.
  page.drawText(ann.text, {
    x: ann.x,
    y: ann.y - TEXT_ASCENT_RATIO * ann.fontSize,
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
  // Opaque white by default — the plain Whiteout tool's own description
  // ("cover part of the page with a white rectangle"). The existing-text
  // patch pipeline (design doc §3) is the one caller that sets `color` to a
  // sampled page background instead, so a tinted or scanned page doesn't get
  // an obviously-wrong white patch.
  page.drawRectangle({
    x: ann.x,
    y: ann.y,
    width: ann.width,
    height: ann.height,
    color: ann.color ? hexToRgb(ann.color) : rgb(1, 1, 1),
  });
}

async function drawImage(
  doc: PDFDocument,
  page: PDFPage,
  ann: { x: number; y: number; width: number; height: number; dataUrl: string; format: "png" | "jpg" },
): Promise<void> {
  const base64 = ann.dataUrl.slice(ann.dataUrl.indexOf(",") + 1);
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const embedded = ann.format === "png" ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
  page.drawImage(embedded, { x: ann.x, y: ann.y, width: ann.width, height: ann.height });
}

function drawMarkup(page: PDFPage, ann: MarkupAnnotation): void {
  const color = hexToRgb(ann.color);
  const thickness = Math.max(1, Math.min(3, ann.height * 0.08));
  // Strikeout sits through the vertical middle of the marked region; underline
  // sits just above its bottom edge, matching where a real text baseline
  // and mid-line would fall for the box the user dragged over.
  const y = ann.type === "strikeout" ? ann.y + ann.height / 2 : ann.y + ann.height * 0.12;
  page.drawLine({
    start: { x: ann.x, y },
    end: { x: ann.x + ann.width, y },
    thickness,
    color,
  });
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

/** Shared across every form-field annotation in one flatten pass, so groups/duplicate names resolve correctly. */
interface FormContext {
  form: PDFForm;
  font: PDFFont;
  usedNames: Set<string>;
  radioGroups: Map<string, PDFRadioGroup>;
}

/** A field name must be unique per document — pdf-lib throws otherwise. Silently dedupes rather than failing the whole export over a naming collision. */
function uniqueFieldName(ctx: FormContext, requested: string): string {
  const base = requested.trim() || "Field";
  if (!ctx.usedNames.has(base)) {
    ctx.usedNames.add(base);
    return base;
  }
  let n = 2;
  while (ctx.usedNames.has(`${base} (${n})`)) n++;
  const name = `${base} (${n})`;
  ctx.usedNames.add(name);
  return name;
}

function drawFormField(page: PDFPage, ann: FormFieldAnnotation, ctx: FormContext): void {
  const common = {
    x: ann.x,
    y: ann.y,
    width: ann.width,
    height: ann.height,
    font: ctx.font,
    borderColor: rgb(0.4, 0.45, 0.9),
    borderWidth: 1,
    backgroundColor: rgb(0.93, 0.95, 1),
  };

  if (ann.kind === "radio") {
    // Every widget sharing `name` belongs to the same group — pdf-lib
    // throws if the same group name is created twice, so reuse it.
    let group = ctx.radioGroups.get(ann.name);
    if (!group) {
      group = ctx.form.createRadioGroup(uniqueFieldName(ctx, ann.name));
      ctx.radioGroups.set(ann.name, group);
    }
    group.addOptionToPage(ann.radioValue || ann.id, page, common);
    return;
  }

  const name = uniqueFieldName(ctx, ann.name);

  if (ann.kind === "checkbox") {
    ctx.form.createCheckBox(name).addToPage(page, common);
  } else if (ann.kind === "dropdown") {
    const dropdown = ctx.form.createDropdown(name);
    dropdown.setOptions(ann.options && ann.options.length ? ann.options : ["Option 1", "Option 2"]);
    dropdown.addToPage(page, common);
  } else {
    const field = ctx.form.createTextField(name);
    if (ann.kind === "multiline") field.enableMultiline();
    field.addToPage(page, common);
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
 * The document's page order/structure as the editor currently has it —
 * built fresh from the live page list on every save, so delete/rotate/
 * insert-page edits are just a different view over the same list rather
 * than a separate change log to replay.
 */
export type PageSlot =
  | { kind: "original"; pageNumber: number; rotationDelta: 0 | 90 | 180 | 270 }
  | { kind: "blank"; id: number; width: number; height: number };

/**
 * Applies delete/rotate/insert-blank-page edits directly to `doc` and
 * returns a map from each `Annotation.page` target (an original page number,
 * or a blank slot's synthetic `id`) to the resulting `PDFPage` object.
 *
 * Page reordering isn't supported by the editor (only delete/insert/rotate),
 * so surviving original pages are guaranteed to still appear in `pageOrder`
 * in their original relative order — that's what makes the insertion pass
 * below safe to do with a single left-to-right running index instead of
 * recomputing indices after each insert.
 */
async function applyPageStructure(doc: PDFDocument, pageOrder: PageSlot[]): Promise<Map<number, PDFPage>> {
  const targetMap = new Map<number, PDFPage>();
  const keptNumbers = pageOrder
    .filter((s): s is Extract<PageSlot, { kind: "original" }> => s.kind === "original")
    .map((s) => s.pageNumber)
    .sort((a, b) => a - b);
  const keptSet = new Set(keptNumbers);

  // Remove pages that no longer appear in pageOrder — highest index first,
  // so earlier removals don't shift the indices of ones still to come.
  for (let i = doc.getPageCount() - 1; i >= 0; i--) {
    if (!keptSet.has(i + 1)) doc.removePage(i);
  }

  // Remaining originals kept their relative order, so zipping them against
  // the sorted kept-number list maps pageNumber -> PDFPage with no index math.
  doc.getPages().forEach((page, i) => {
    const pageNumber = keptNumbers[i];
    if (pageNumber !== undefined) targetMap.set(pageNumber, page);
  });

  for (const slot of pageOrder) {
    if (slot.kind !== "original" || !slot.rotationDelta) continue;
    const page = targetMap.get(slot.pageNumber);
    if (page) page.setRotation(degrees(page.getRotation().angle + slot.rotationDelta));
  }

  // Insert blanks left-to-right. Each insertPage(i, ...) call shifts every
  // later page up by one, which is exactly what keeps the *next* iteration's
  // index correct — see the doc comment above.
  pageOrder.forEach((slot, i) => {
    if (slot.kind !== "blank") return;
    targetMap.set(slot.id, doc.insertPage(i, [slot.width, slot.height]));
  });

  return targetMap;
}

/**
 * Flattens all annotations onto the PDF and returns the new bytes.
 * Annotations become part of the page content — they are no longer editable
 * as separate objects after this. That is intentional: the output is a
 * finished PDF for sharing, not an editable working copy.
 *
 * `pageOrder`, when given, also applies the editor's delete/rotate/insert
 * page-structure edits before drawing. Omitting it keeps every original
 * page as-is (pageNumber `n` -> the document's nth page) — the pre-Phase-3
 * behavior, and what a caller with no page-structure UI still wants.
 *
 * `customFontBytes`, when given, supplies real font programs (TrueType
 * bytes) keyed by the same `StandardFontName`s pdf-lib's own 14 base fonts
 * use. When a name is present here, its bytes are embedded via fontkit
 * *instead of* `doc.embedFont(name)`. This matters because pdf-lib's named
 * standard fonts aren't embedded font programs at all — they're just a
 * `/BaseFont` name reference, and every PDF viewer substitutes its own
 * local "Helvetica"/"Times"/"Courier" for that name. That substitution is
 * inconsistent across viewers/OSes, and never matches this editor's own
 * on-screen CSS preview of the same text — the mismatch a user sees is
 * real, not a matching-heuristic bug (see fontMatch.ts). Embedding an
 * actual, redistributable, full-Latin-coverage font program (the caller's
 * job to supply — see edit-pdf's bundled Arimo/Tinos/Cousine, metric-
 * compatible clones of Arial/Times New Roman/Courier New) instead makes
 * the exported PDF render identically everywhere, and match the preview.
 */
export async function flattenAnnotations(
  bytes: ArrayBuffer,
  annotations: Annotation[],
  pageOrder?: PageSlot[],
  customFontBytes?: Partial<Record<StandardFontName, ArrayBuffer>>,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  if (customFontBytes) doc.registerFontkit(fontkit);

  async function embed(key: StandardFontName): Promise<PDFFont> {
    const custom = customFontBytes?.[key];
    return custom ? doc.embedFont(custom, { subset: true }) : doc.embedFont(key);
  }

  const font = await embed(StandardFonts.Helvetica);

  // Every text annotation used to be Helvetica unconditionally; the
  // existing-text patch pipeline (design doc §3) is the first thing that
  // picks a matched standard font per run, so text drawing now embeds
  // lazily per distinct font name instead of once up front.
  const fontCache = new Map<string, PDFFont>([[StandardFonts.Helvetica, font]]);
  async function getFont(name: StandardFontName | undefined): Promise<PDFFont> {
    const key = name ?? StandardFonts.Helvetica;
    const cached = fontCache.get(key);
    if (cached) return cached;
    const embedded = await embed(key);
    fontCache.set(key, embedded);
    return embedded;
  }

  const targetPages = pageOrder
    ? await applyPageStructure(doc, pageOrder)
    : new Map(doc.getPages().map((page, i) => [i + 1, page]));

  const formCtx: FormContext = { form: doc.getForm(), font, usedNames: new Set(), radioGroups: new Map() };

  // Draw order: whiteout first (it must cover original content, not later
  // additions), then highlight (translucent, should sit under ink), then
  // images/shapes, then markup/pen/text/signature/form-field on top, links
  // last (position-only, no paint).
  const order: Record<Annotation["type"], number> = {
    whiteout: 0,
    highlight: 1,
    image: 2,
    shape: 3,
    strikeout: 4,
    underline: 4,
    pen: 5,
    text: 6,
    signature: 7,
    "form-field": 7,
    link: 8,
  };
  const sorted = [...annotations].sort((a, b) => order[a.type] - order[b.type]);

  for (const ann of sorted) {
    const page = targetPages.get(ann.page);
    if (!page) continue;

    if (ann.type === "text") drawText(page, ann, await getFont(ann.fontFamily));
    else if (ann.type === "highlight") drawHighlight(page, ann);
    else if (ann.type === "pen") drawPen(page, ann);
    else if (ann.type === "whiteout") drawWhiteout(page, ann);
    else if (ann.type === "shape") drawShape(page, ann);
    else if (ann.type === "image") await drawImage(doc, page, ann);
    else if (ann.type === "signature") await drawImage(doc, page, ann);
    else if (ann.type === "strikeout" || ann.type === "underline") drawMarkup(page, ann);
    else if (ann.type === "form-field") drawFormField(page, ann, formCtx);
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
