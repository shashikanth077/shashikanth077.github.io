/**
 * PDF structure operations, backed by pdf-lib.
 *
 * These are lossless page-level manipulations — merge, split, rotate, reorder.
 * pdf-lib rewrites the document object graph without re-encoding content
 * streams, so text stays selectable and images keep their original quality.
 *
 * Anything requiring content-stream re-encoding (real compression) or font
 * layout (Office conversion) is NOT here — see pdf-render.ts and office.ts,
 * which carry their own honest caveats.
 */

import { PDFDocument, degrees } from "pdf-lib";

export interface PdfInfo {
  pageCount: number;
  title: string | null;
  author: string | null;
  /** Page sizes in PostScript points (72pt = 1 inch). */
  pages: Array<{ width: number; height: number; rotation: number }>;
  encrypted: boolean;
}

/**
 * pdf-lib refuses encrypted documents unless explicitly told to ignore it.
 * `ignoreEncryption` handles the common "printing restricted" style of
 * permissions, but NOT a document that needs a password to open — that throws.
 */
async function load(bytes: ArrayBuffer): Promise<PDFDocument> {
  return PDFDocument.load(bytes, { ignoreEncryption: true });
}

export async function readPdfInfo(bytes: ArrayBuffer): Promise<PdfInfo> {
  const doc = await load(bytes);
  return {
    pageCount: doc.getPageCount(),
    title: doc.getTitle() ?? null,
    author: doc.getAuthor() ?? null,
    encrypted: doc.isEncrypted,
    pages: doc.getPages().map((p) => ({
      width: Math.round(p.getWidth()),
      height: Math.round(p.getHeight()),
      rotation: p.getRotation().angle,
    })),
  };
}

export async function mergePdfs(files: ArrayBuffer[]): Promise<Uint8Array> {
  if (files.length < 2) throw new Error("Add at least two PDFs to merge.");

  const out = await PDFDocument.create();
  for (const bytes of files) {
    const doc = await load(bytes);
    const pages = await out.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => out.addPage(page));
  }
  return out.save();
}

/**
 * Parses "1-3, 5, 8-10" into zero-based indices, validated against pageCount.
 * Users think in 1-based pages; every API here is 0-based.
 */
export function parsePageRanges(spec: string, pageCount: number): number[] {
  const indices = new Set<number>();

  for (const part of spec.split(",")) {
    const chunk = part.trim();
    if (!chunk) continue;

    const range = /^(\d+)\s*-\s*(\d+)$/.exec(chunk);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (start < 1 || end > pageCount || start > end) {
        throw new Error(`Range "${chunk}" is outside 1-${pageCount}.`);
      }
      for (let i = start; i <= end; i++) indices.add(i - 1);
      continue;
    }

    const single = /^\d+$/.exec(chunk);
    if (!single) throw new Error(`"${chunk}" is not a page or range.`);
    const page = Number(chunk);
    if (page < 1 || page > pageCount) {
      throw new Error(`Page ${page} is outside 1-${pageCount}.`);
    }
    indices.add(page - 1);
  }

  if (indices.size === 0) throw new Error("Specify at least one page.");
  return [...indices].sort((a, b) => a - b);
}

/** Builds a new PDF containing only `indices`, in the order given. */
export async function extractPages(bytes: ArrayBuffer, indices: number[]): Promise<Uint8Array> {
  const source = await load(bytes);
  const out = await PDFDocument.create();
  const pages = await out.copyPages(source, indices);
  pages.forEach((page) => out.addPage(page));
  return out.save();
}

export async function removePages(bytes: ArrayBuffer, remove: number[]): Promise<Uint8Array> {
  const source = await load(bytes);
  const drop = new Set(remove);
  const keep = source.getPageIndices().filter((i) => !drop.has(i));
  if (keep.length === 0) throw new Error("That would remove every page.");
  return extractPages(bytes, keep);
}

/** Splits into one document per range spec entry, e.g. "1-3, 4-6" → two files. */
export async function splitIntoRanges(
  bytes: ArrayBuffer,
  specs: string[],
  pageCount: number,
): Promise<Array<{ name: string; data: Uint8Array }>> {
  const results: Array<{ name: string; data: Uint8Array }> = [];
  for (const [i, spec] of specs.entries()) {
    const indices = parsePageRanges(spec, pageCount);
    results.push({
      name: `part-${i + 1}-pages-${spec.replace(/\s+/g, "")}.pdf`,
      data: await extractPages(bytes, indices),
    });
  }
  return results;
}

/** One document per page. */
export async function splitEveryPage(bytes: ArrayBuffer): Promise<Array<{ name: string; data: Uint8Array }>> {
  const source = await load(bytes);
  const out: Array<{ name: string; data: Uint8Array }> = [];
  for (const index of source.getPageIndices()) {
    out.push({ name: `page-${index + 1}.pdf`, data: await extractPages(bytes, [index]) });
  }
  return out;
}

/**
 * Rotation is cumulative on top of any rotation already stored on the page,
 * and normalised to 0/90/180/270 — pdf-lib rejects other multiples.
 */
export async function rotatePdf(
  bytes: ArrayBuffer,
  turn: 90 | 180 | 270,
  only?: number[],
): Promise<Uint8Array> {
  const doc = await load(bytes);
  const target = only ? new Set(only) : null;

  doc.getPages().forEach((page, index) => {
    if (target && !target.has(index)) return;
    const next = (page.getRotation().angle + turn) % 360;
    page.setRotation(degrees(next));
  });

  return doc.save();
}

export async function reorderPages(bytes: ArrayBuffer, order: number[]): Promise<Uint8Array> {
  return extractPages(bytes, order);
}

/* ------------------------------------------------------------------ */
/* Images → PDF                                                         */
/* ------------------------------------------------------------------ */

export type PageFit = "fit" | "actual";
export type PageSizeName = "a4" | "letter" | "auto";

const PAGE_SIZES: Record<Exclude<PageSizeName, "auto">, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

export interface ImageToPdfOptions {
  pageSize?: PageSizeName;
  margin?: number;
  fit?: PageFit;
}

/**
 * pdf-lib embeds only JPEG and PNG natively. Anything else (WebP, AVIF) must be
 * transcoded first — imageToPngBytes in image.ts does that via canvas.
 */
export async function imagesToPdf(
  images: Array<{ bytes: ArrayBuffer; type: string }>,
  options: ImageToPdfOptions = {},
): Promise<Uint8Array> {
  const { pageSize = "a4", margin = 24, fit = "fit" } = options;
  if (images.length === 0) throw new Error("Add at least one image.");

  const doc = await PDFDocument.create();

  for (const image of images) {
    const isPng = image.type.includes("png");
    const isJpeg = /jpe?g/.test(image.type);
    if (!isPng && !isJpeg) {
      throw new Error(`Unsupported image type "${image.type}" — convert it to PNG or JPEG first.`);
    }

    const embedded = isPng ? await doc.embedPng(image.bytes) : await doc.embedJpg(image.bytes);

    const [pw, ph] =
      pageSize === "auto"
        ? [embedded.width + margin * 2, embedded.height + margin * 2]
        : PAGE_SIZES[pageSize];

    const page = doc.addPage([pw, ph]);
    const maxW = pw - margin * 2;
    const maxH = ph - margin * 2;

    const scale =
      fit === "actual" ? 1 : Math.min(maxW / embedded.width, maxH / embedded.height, 1);
    const w = embedded.width * scale;
    const h = embedded.height * scale;

    page.drawImage(embedded, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
  }

  return doc.save();
}

/* ------------------------------------------------------------------ */
/* Metadata                                                             */
/* ------------------------------------------------------------------ */

export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
}

export async function setPdfMetadata(bytes: ArrayBuffer, meta: PdfMetadata): Promise<Uint8Array> {
  const doc = await load(bytes);
  if (meta.title !== undefined) doc.setTitle(meta.title);
  if (meta.author !== undefined) doc.setAuthor(meta.author);
  if (meta.subject !== undefined) doc.setSubject(meta.subject);
  if (meta.keywords !== undefined) doc.setKeywords(meta.keywords);
  doc.setModificationDate(new Date());
  return doc.save();
}

/**
 * Strips owner-password permission flags by rebuilding the document.
 *
 * This does NOT crack anything: pdf-lib can already read these files, and the
 * restriction is only a flag a compliant reader chooses to honour. A document
 * that needs a password to *open* cannot be loaded at all and throws instead.
 */
export async function removeRestrictions(bytes: ArrayBuffer): Promise<Uint8Array> {
  const source = await load(bytes);
  if (!source.isEncrypted) throw new Error("This PDF has no restrictions to remove.");

  const out = await PDFDocument.create();
  const pages = await out.copyPages(source, source.getPageIndices());
  pages.forEach((page) => out.addPage(page));
  return out.save();
}

/**
 * Removes owner-password restrictions from a PDF and rebuilds it without
 * encryption flags. Returns the unlocked bytes and whether the document
 * was actually encrypted.
 *
 * This handles owner-password PDFs (no-print / no-copy flags). pdf-lib
 * cannot decrypt user-password PDFs (those that need a password to open),
 * so those will throw on load.
 */
export async function unlockPdf(
  bytes: ArrayBuffer,
): Promise<{ data: Uint8Array; wasEncrypted: boolean }> {
  const doc = await load(bytes);
  const wasEncrypted = doc.isEncrypted;

  const out = await PDFDocument.create();
  const pages = await out.copyPages(doc, doc.getPageIndices());
  pages.forEach((page) => out.addPage(page));

  return { data: await out.save(), wasEncrypted };
}
