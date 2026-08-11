/**
 * PDF rasterisation and text extraction, backed by pdf.js.
 *
 * Separate from pdf.ts because pdf.js is a large dependency with a Web Worker,
 * and the page-level operations in pdf.ts must not drag it in.
 */

import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";

// Vite resolves this to a bundled worker URL at build time. Without it pdf.js
// falls back to running on the main thread, which locks the tab on big files.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export interface LoadedPdf {
  doc: PDFDocumentProxy;
  pageCount: number;
  /**
   * Releases the worker and its memory. Callers must await this — the document
   * proxy itself has no public destroy in the v6 typings; the loading task owns
   * teardown.
   */
  close: () => Promise<void>;
}

/**
 * @param password supplied only after a PasswordException — see needsPassword().
 */
export async function openPdf(bytes: ArrayBuffer, password?: string): Promise<LoadedPdf> {
  // pdf.js transfers and neuters the buffer, so hand it a copy: callers often
  // reuse the same ArrayBuffer for a second operation.
  const task: PDFDocumentLoadingTask = pdfjs.getDocument({
    data: new Uint8Array(bytes.slice(0)),
    password,
  });
  const doc = await task.promise;
  return { doc, pageCount: doc.numPages, close: () => task.destroy() };
}

/** True when the error from openPdf means "this file needs a password". */
export function needsPassword(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "name" in error &&
      (error as { name?: string }).name === "PasswordException",
  );
}

export interface PdfRenderOptions {
  /** 1 = 72dpi. 2 ≈ 144dpi, a good screen/print compromise. */
  scale?: number;
  type?: "image/png" | "image/jpeg";
  quality?: number;
}

async function renderPageToCanvas(
  doc: PDFDocumentProxy,
  pageNumber: number,
  scale: number,
): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  if (!canvas.getContext("2d")) throw new Error("Could not get a 2D canvas context.");

  // Three deliberate choices here:
  //
  // `canvas`, never `canvasContext` — they are mutually exclusive in pdf.js v5+.
  // canvasContext is the legacy path and requires `canvas: null`; supplying both
  // leaves the render promise pending forever, with no error, just a hang.
  //
  // `intent: "print"` — pdf.js drives its render loop with requestAnimationFrame
  // for the "display" intent, which browsers stop firing in a hidden tab. A user
  // who starts a long conversion and switches tabs would see it stall until they
  // came back. "print" makes pdf.js schedule with setTimeout instead, and is the
  // more accurate intent anyway: this output is a file, not a viewport.
  //
  // `background` — PDF pages have no opaque backdrop and JPEG has no alpha, so
  // without it every exported page comes out black.
  await page.render({ canvas, viewport, intent: "print", background: "#ffffff" }).promise;
  page.cleanup();
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas could not be encoded."))),
      type,
      quality,
    );
  });
}

export interface RenderedPage {
  pageNumber: number;
  blob: Blob;
  width: number;
  height: number;
  /** Object URL for preview. Caller must revoke it. */
  url: string;
}

export async function pdfToImages(
  bytes: ArrayBuffer,
  options: PdfRenderOptions = {},
  onProgress?: (done: number, total: number) => void,
): Promise<RenderedPage[]> {
  const { scale = 2, type = "image/png", quality = 0.92 } = options;
  const { doc, pageCount, close } = await openPdf(bytes);
  const out: RenderedPage[] = [];

  try {
    for (let n = 1; n <= pageCount; n++) {
      const canvas = await renderPageToCanvas(doc, n, scale);
      const blob = await canvasToBlob(canvas, type, quality);
      out.push({
        pageNumber: n,
        blob,
        width: canvas.width,
        height: canvas.height,
        url: URL.createObjectURL(blob),
      });
      onProgress?.(n, pageCount);
      // Free the backing store immediately; a 300-page document otherwise
      // holds every canvas alive until the loop ends.
      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    await close();
  }

  return out;
}

/** Renders a single page — used for the live preview thumbnail. */
export async function renderFirstPage(bytes: ArrayBuffer, scale = 0.6): Promise<string> {
  const { doc, close } = await openPdf(bytes);
  try {
    const canvas = await renderPageToCanvas(doc, 1, scale);
    const blob = await canvasToBlob(canvas, "image/png", 0.9);
    return URL.createObjectURL(blob);
  } finally {
    await close();
  }
}

/* ------------------------------------------------------------------ */
/* Text extraction                                                      */
/* ------------------------------------------------------------------ */

export interface ExtractedPage {
  pageNumber: number;
  /** Paragraph-ish blocks, split on vertical gaps. */
  paragraphs: string[];
}

/**
 * PDF stores positioned glyph runs, not paragraphs. There is no structural
 * "paragraph" to read, so this reconstructs them from geometry: a new block
 * starts when the vertical position jumps by more than a line height.
 *
 * Good on single-column prose. Multi-column layouts and tables will interleave
 * — that is inherent to the format, not a bug to be fixed here, and the UI
 * says so.
 */
export async function pdfToText(
  bytes: ArrayBuffer,
  onProgress?: (done: number, total: number) => void,
): Promise<ExtractedPage[]> {
  const { doc, pageCount, close } = await openPdf(bytes);
  const pages: ExtractedPage[] = [];

  try {
    for (let n = 1; n <= pageCount; n++) {
      const page = await doc.getPage(n);
      const content = await page.getTextContent();

      const paragraphs: string[] = [];
      let current = "";
      let lastY: number | null = null;

      for (const item of content.items) {
        if (!("str" in item)) continue;
        const y = item.transform[5] as number;
        const height = (item.height as number) || 10;

        if (lastY !== null && Math.abs(lastY - y) > height * 1.6) {
          if (current.trim()) paragraphs.push(current.trim().replace(/\s+/g, " "));
          current = "";
        } else if (lastY !== null && Math.abs(lastY - y) > height * 0.3) {
          current += " ";
        }

        current += item.str;
        if (item.hasEOL) current += " ";
        lastY = y;
      }

      if (current.trim()) paragraphs.push(current.trim().replace(/\s+/g, " "));
      pages.push({ pageNumber: n, paragraphs });

      page.cleanup();
      onProgress?.(n, pageCount);
    }
  } finally {
    await close();
  }

  return pages;
}

export function extractedPagesToPlainText(pages: ExtractedPage[]): string {
  return pages.map((p) => p.paragraphs.join("\n\n")).join("\n\n\n");
}

/** True when nothing was extracted — almost always a scanned/image-only PDF. */
export function looksScanned(pages: ExtractedPage[]): boolean {
  const characters = pages.reduce((sum, p) => sum + p.paragraphs.join("").length, 0);
  return characters < pages.length * 20;
}

/* ------------------------------------------------------------------ */
/* Password-unlock via rasterisation                                    */
/* ------------------------------------------------------------------ */

/**
 * Opens a user-password PDF with the supplied password, rasterises every page
 * to JPEG, and rebuilds as a new unencrypted PDF.
 *
 * The output is lossier than owner-password unlock (text becomes images) because
 * pdf-lib cannot decrypt user-password content streams — pdfjs renders them to
 * canvas first, then pdf-lib embeds those canvases.
 *
 * Throws a pdfjs PasswordException (name === "PasswordException") if the
 * password is wrong — callers can detect this with needsPassword().
 */
export async function unlockWithPassword(
  bytes: ArrayBuffer,
  password: string,
  onProgress?: (done: number, total: number) => void,
): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const { doc, pageCount, close } = await openPdf(bytes, password);
  const out = await PDFDocument.create();
  const blobs: Array<{ blob: Blob; width: number; height: number; url: string }> = [];

  try {
    for (let n = 1; n <= pageCount; n++) {
      const canvas = await renderPageToCanvas(doc, n, 2);
      const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
      blobs.push({ blob, width: canvas.width, height: canvas.height, url: URL.createObjectURL(blob) });
      canvas.width = 0;
      canvas.height = 0;
      onProgress?.(n, pageCount);
    }

    for (const { blob, width, height } of blobs) {
      const jpeg = await blob.arrayBuffer();
      const embedded = await out.embedJpg(jpeg);
      const page = out.addPage([width, height]);
      page.drawImage(embedded, { x: 0, y: 0, width, height });
    }
  } finally {
    await close();
    blobs.forEach((b) => URL.revokeObjectURL(b.url));
  }

  return out.save();
}

/* ------------------------------------------------------------------ */
/* Lossy compression                                                    */
/* ------------------------------------------------------------------ */

export interface CompressResult {
  data: Uint8Array;
  beforeBytes: number;
  afterBytes: number;
  percent: number;
}

/**
 * Rasterises every page to JPEG and rebuilds the document around the images.
 *
 * This is genuinely lossy and one-way: text stops being selectable and becomes
 * a picture of text. Proper compression re-encodes the existing content streams
 * (what Ghostscript does) and has no browser equivalent. The UI must present
 * this as "flatten to images", not as ordinary compression, because on a
 * text-only PDF it will often make the file *larger*.
 */
export async function compressByRasterising(
  bytes: ArrayBuffer,
  options: { scale?: number; quality?: number } = {},
  onProgress?: (done: number, total: number) => void,
): Promise<CompressResult> {
  const { scale = 1.5, quality = 0.6 } = options;
  const { PDFDocument } = await import("pdf-lib");

  const pages = await pdfToImages(bytes, { scale, type: "image/jpeg", quality }, onProgress);
  const out = await PDFDocument.create();

  try {
    for (const page of pages) {
      const jpeg = await page.blob.arrayBuffer();
      const embedded = await out.embedJpg(jpeg);
      const pdfPage = out.addPage([embedded.width, embedded.height]);
      pdfPage.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
    }
  } finally {
    pages.forEach((p) => URL.revokeObjectURL(p.url));
  }

  const data = await out.save();
  return {
    data,
    beforeBytes: bytes.byteLength,
    afterBytes: data.byteLength,
    percent: Math.round(((bytes.byteLength - data.byteLength) / bytes.byteLength) * 100),
  };
}

/**
 * Rasterises every page to a desaturated JPEG and rebuilds the document
 * around the images — the same one-way tradeoff as compressByRasterising
 * (text stops being selectable) for the same reason: there's no browser
 * equivalent of rewriting a content stream's color operators in place, so
 * "grayscale the actual vectors and text" isn't achievable client-side. The
 * luminance weights (0.299/0.587/0.114) are the standard ITU-R BT.601
 * formula most grayscale conversion tools use, not an arbitrary average.
 */
export async function grayscalePdf(
  bytes: ArrayBuffer,
  options: { scale?: number; quality?: number } = {},
  onProgress?: (done: number, total: number) => void,
): Promise<Uint8Array> {
  const { scale = 2, quality = 0.85 } = options;
  const { PDFDocument } = await import("pdf-lib");
  const { doc, pageCount, close } = await openPdf(bytes);
  const out = await PDFDocument.create();

  try {
    for (let n = 1; n <= pageCount; n++) {
      const canvas = await renderPageToCanvas(doc, n, scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get a 2D canvas context.");

      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const px = frame.data;
      for (let i = 0; i < px.length; i += 4) {
        const r = px[i]!;
        const g = px[i + 1]!;
        const b = px[i + 2]!;
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        px[i] = gray;
        px[i + 1] = gray;
        px[i + 2] = gray;
      }
      ctx.putImageData(frame, 0, 0);

      const blob = await canvasToBlob(canvas, "image/jpeg", quality);
      const jpeg = await blob.arrayBuffer();
      const embedded = await out.embedJpg(jpeg);
      const pdfPage = out.addPage([embedded.width, embedded.height]);
      pdfPage.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });

      onProgress?.(n, pageCount);
      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    await close();
  }

  return out.save();
}
