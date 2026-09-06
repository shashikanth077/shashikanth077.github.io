/**
 * Word (.docx) conversion, and everything else that turns a non-PDF document
 * format into a PDF by laying its content out rather than doing a lossless
 * pdf-lib structural edit (see pdf.ts for those).
 *
 * Read this before trusting the output:
 *
 * DOCX → HTML is genuinely good. mammoth maps Word's semantic styles onto HTML
 * elements, so headings, lists, tables, bold/italic and links survive.
 *
 * DOCX → PDF has no perfect browser answer. There is no layout engine that
 * reproduces Word's pagination, so both paths here are compromises and the UI
 * names them honestly: rasterised (looks right, text not selectable) or the
 * browser's own print pipeline (real text, but you pick the destination).
 * The same two paths serve HTML → PDF, for the same reason.
 *
 * PDF → DOCX cannot round-trip. PDF stores positioned glyphs, not paragraphs,
 * so the best available result is extracted text rebuilt into a plain Word
 * document. Styling, columns and tables do not survive. Any site claiming
 * otherwise is either using a commercial engine or overpromising.
 *
 * TXT → PDF and CSV → PDF, by contrast, build a real vector PDF directly
 * with pdf-lib (see textToPdf/csvToPdf below) — there's no browser layout
 * engine to lean on or avoid, since the source has no layout at all beyond
 * line breaks and a grid of cells.
 */

import mammoth from "mammoth";
import DOMPurify from "dompurify";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

/* ------------------------------------------------------------------ */
/* DOCX → HTML                                                          */
/* ------------------------------------------------------------------ */

export interface DocxHtmlResult {
  html: string;
  /** mammoth's notes about anything it could not map cleanly. */
  warnings: string[];
}

const DOCX_ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr", "blockquote", "pre", "code",
  "ul", "ol", "li",
  "strong", "em", "u", "s", "sub", "sup",
  "a", "img",
  "table", "thead", "tbody", "tr", "th", "td",
  "span", "div",
];

export async function docxToHtml(bytes: ArrayBuffer): Promise<DocxHtmlResult> {
  const result = await mammoth.convertToHtml(
    { arrayBuffer: bytes },
    {
      // Word's own style names → semantic HTML, so the output is structured
      // rather than a pile of styled <p>s.
      styleMap: [
        "p[style-name='Title'] => h1:fresh",
        "p[style-name='Subtitle'] => h2:fresh",
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Quote'] => blockquote:fresh",
      ],
    },
  );

  return {
    // Embedded images arrive as data: URIs, which the default URI policy would
    // strip — allow them here but nowhere else.
    html: DOMPurify.sanitize(result.value, {
      ALLOWED_TAGS: DOCX_ALLOWED_TAGS,
      ALLOWED_ATTR: ["href", "src", "alt", "title", "colspan", "rowspan", "style", "class"],
      ALLOWED_URI_REGEXP: /^(?:https?|mailto|tel):|^data:image\/(png|jpe?g|gif|webp);base64,|^[#/]/i,
    }),
    warnings: result.messages.map((m) => m.message),
  };
}

export async function docxToPlainText(bytes: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer: bytes });
  return result.value;
}

/* ------------------------------------------------------------------ */
/* HTML → PDF                                                           */
/* ------------------------------------------------------------------ */

export interface HtmlToPdfOptions {
  pageSize?: "a4" | "letter";
  marginMm?: number;
  /** CSS pixel width the HTML is laid out at before scaling to the page. */
  contentWidthPx?: number;
}

/**
 * Rasterising path: html2canvas paints the DOM, jsPDF paginates the bitmap.
 *
 * Output looks like the source but the text becomes an image — not selectable,
 * not searchable, and larger on disk. Chosen when the user wants a one-click
 * download. printHtmlToPdf() below is the higher-quality alternative.
 */
export async function htmlToPdfBlob(
  html: string,
  options: HtmlToPdfOptions = {},
): Promise<Blob> {
  const { pageSize = "a4", marginMm = 12, contentWidthPx = 794 } = options;
  const { jsPDF } = await import("jspdf");

  // Render off-screen but still laid out — display:none has no dimensions and
  // html2canvas would capture nothing.
  const host = document.createElement("div");
  host.style.cssText = `position:fixed;left:-10000px;top:0;width:${contentWidthPx}px;background:#fff;`;
  host.innerHTML = html;
  host.classList.add("dt-print-root");
  document.body.appendChild(host);

  try {
    const pdf = new jsPDF({ unit: "mm", format: pageSize, orientation: "portrait" });
    await pdf.html(host, {
      margin: [marginMm, marginMm, marginMm, marginMm],
      autoPaging: "text",
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false },
      width: pdf.internal.pageSize.getWidth() - marginMm * 2,
      windowWidth: contentWidthPx,
    });
    return pdf.output("blob");
  } finally {
    host.remove();
  }
}

/**
 * Native path: hands the HTML to the browser's own print pipeline.
 *
 * Produces a real vector PDF with selectable, searchable text — strictly better
 * output than the rasterising path. The trade-off is that the browser owns the
 * dialog, so the user picks "Save as PDF" themselves; we cannot auto-download.
 */
export function printHtmlToPdf(html: string, title: string): void {
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(frame);

  const doc = frame.contentDocument;
  if (!doc) {
    frame.remove();
    throw new Error("Could not open a print frame.");
  }

  doc.open();
  doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  @page { size: A4; margin: 18mm; }
  body { font-family: Calibri, Carlito, "Segoe UI", sans-serif; font-size: 11pt; line-height: 1.5; color: #000; }
  h1,h2,h3,h4 { line-height: 1.25; margin: 1.2em 0 0.5em; }
  h1 { font-size: 20pt; } h2 { font-size: 16pt; } h3 { font-size: 13pt; }
  p { margin: 0 0 0.6em; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #999; padding: 4pt 6pt; text-align: left; }
  img { max-width: 100%; }
  blockquote { border-left: 3px solid #ccc; margin-left: 0; padding-left: 12pt; color: #333; }
</style></head><body>${html}</body></html>`);
  doc.close();

  const cleanup = () => setTimeout(() => frame.remove(), 1000);
  frame.contentWindow?.addEventListener("afterprint", cleanup);

  // Give the iframe a tick to lay out and load any data: images before printing.
  setTimeout(() => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    cleanup();
  }, 350);
}

/* ------------------------------------------------------------------ */
/* Text → DOCX                                                          */
/* ------------------------------------------------------------------ */

export interface DocxBuildOptions {
  title?: string;
  /** Insert an explicit page break between source pages. */
  pageBreaks?: boolean;
}

/**
 * Builds a .docx from extracted paragraphs.
 *
 * Everything here is body text — there is no styling information to carry over,
 * because the PDF never had any in a form that survives extraction. The result
 * is editable in Word, which is the actual goal.
 */
export async function paragraphsToDocx(
  pages: Array<{ pageNumber: number; paragraphs: string[] }>,
  options: DocxBuildOptions = {},
): Promise<Blob> {
  const { title, pageBreaks = true } = options;
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");

  const children: InstanceType<typeof Paragraph>[] = [];

  if (title) {
    children.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }));
  }

  pages.forEach((page, index) => {
    for (const text of page.paragraphs) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text, size: 22 })], // half-points: 22 = 11pt
          spacing: { after: 160 },
        }),
      );
    }
    if (pageBreaks && index < pages.length - 1) {
      children.push(new Paragraph({ children: [], pageBreakBefore: true }));
    }
  });

  if (children.length === 0) {
    throw new Error("No text was extracted, so there is nothing to put in the document.");
  }

  const doc = new Document({ sections: [{ properties: {}, children }] });
  return Packer.toBlob(doc);
}

/* ------------------------------------------------------------------ */
/* HTML file → PDF                                                      */
/* ------------------------------------------------------------------ */

/** Same tag/attribute allowance as docxToHtml's output, plus <style> — a
 * hand-authored or exported HTML file (unlike mammoth's own output) commonly
 * carries its own <style> block, and stripping it would defeat the point of
 * converting *that* file rather than its plain text. */
const HTML_FILE_ALLOWED_TAGS = [...DOCX_ALLOWED_TAGS, "style"];

/**
 * Prepares an arbitrary uploaded .html file for htmlToPdfBlob()/printHtmlToPdf(),
 * which both expect a body-fragment string, not a full document.
 *
 * A full `<html>...</html>` document's <head> <style> rules are pulled out and
 * prepended to the sanitized <body> content (as their own <style> tag) rather
 * than discarded — CSS in a <style> tag cannot execute script, so keeping it
 * is safe and is often the entire visual difference between a real render and
 * an unstyled wall of text. A bare fragment (no <html> wrapper at all) is
 * sanitized as-is.
 */
export function htmlFileToPdfHtml(rawHtml: string): { html: string; title: string | null } {
  const parsed = new DOMParser().parseFromString(rawHtml, "text/html");
  const styles = Array.from(parsed.querySelectorAll("style"))
    .map((el) => el.textContent ?? "")
    .join("\n");
  const bodySource = parsed.body ? parsed.body.innerHTML : rawHtml;

  const sanitizedBody = DOMPurify.sanitize(bodySource, {
    ALLOWED_TAGS: HTML_FILE_ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "src", "alt", "title", "colspan", "rowspan", "style", "class", "id"],
    ALLOWED_URI_REGEXP: /^(?:https?|mailto|tel):|^data:image\/(png|jpe?g|gif|webp);base64,|^[#/]/i,
  });
  // DOMPurify sanitizes each fragment on its own terms — sanitizing the
  // extracted <style> text through the same ALLOWED_TAGS would strip it (a
  // stylesheet isn't tag-shaped), so it's wrapped and appended untouched.
  const sanitizedStyles = styles.trim() ? DOMPurify.sanitize(`<style>${styles}</style>`, { ALLOWED_TAGS: ["style"] }) : "";

  return {
    html: sanitizedStyles + sanitizedBody,
    title: parsed.title || null,
  };
}

/* ------------------------------------------------------------------ */
/* Plain text → PDF                                                     */
/* ------------------------------------------------------------------ */

const TEXT_PAGE_SIZES: Record<"a4" | "letter", [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

export interface TextToPdfOptions {
  pageSize?: "a4" | "letter";
  fontSize?: number;
  /** Monospace preserves a plain-text file's own alignment/indentation (ASCII tables, code, logs) — the same reason terminals and code editors default to one. */
  monospace?: boolean;
}

/** Greedily wraps `line` to fit `maxWidth`, breaking on spaces; a single word
 * wider than `maxWidth` on its own is kept whole rather than split mid-word. */
function wrapLine(line: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  if (font.widthOfTextAtSize(line, fontSize) <= maxWidth) return [line];
  const words = line.split(" ");
  const wrapped: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && font.widthOfTextAtSize(candidate, fontSize) > maxWidth) {
      wrapped.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) wrapped.push(current);
  return wrapped;
}

/**
 * Lays plain text out into a paginated PDF: pdf-lib draws from a font metric
 * table, not a browser layout engine, so wrapping is done by hand here —
 * greedy word-wrap per *original* line (a blank line stays a blank line, a
 * short line stays its own line) rather than reflowing the whole file into
 * one paragraph stream, which would silently destroy any intentional
 * structure a plain-text file relies on more than prose does (an ASCII
 * table, a code listing, a log's own line-per-event shape).
 */
export async function textToPdf(text: string, options: TextToPdfOptions = {}): Promise<Uint8Array> {
  const { pageSize = "a4", fontSize = 11, monospace = true } = options;
  const [pageWidth, pageHeight] = TEXT_PAGE_SIZES[pageSize];
  const margin = 54; // 0.75in
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = fontSize * 1.35;

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(monospace ? StandardFonts.Courier : StandardFonts.Helvetica);

  let page: PDFPage = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  function newPage() {
    page = doc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  }

  const sourceLines = text.split(/\r\n|\r|\n/);
  for (const sourceLine of sourceLines) {
    const wrapped = sourceLine === "" ? [""] : wrapLine(sourceLine, font, fontSize, maxWidth);
    for (const line of wrapped) {
      if (y < margin) newPage();
      if (line) page.drawText(line, { x: margin, y: y - fontSize, size: fontSize, font, color: rgb(0, 0, 0) });
      y -= lineHeight;
    }
  }

  return doc.save();
}

/* ------------------------------------------------------------------ */
/* CSV → PDF                                                            */
/* ------------------------------------------------------------------ */

/**
 * A small hand-rolled parser instead of a dependency: CSV has no single
 * standard, but the RFC 4180 shape (quoted fields, "" as an escaped quote,
 * commas/newlines inside quotes) covers what every spreadsheet actually
 * exports, and is the only part worth getting right here.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const n = text.length;

  function endField() {
    row.push(field);
    field = "";
  }
  function endRow() {
    endField();
    rows.push(row);
    row = [];
  }

  while (i < n) {
    const c = text[i]!;
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
    } else if (c === ",") {
      endField();
      i++;
    } else if (c === "\r" && text[i + 1] === "\n") {
      endRow();
      i += 2;
    } else if (c === "\n" || c === "\r") {
      endRow();
      i++;
    } else {
      field += c;
      i++;
    }
  }
  // A trailing row with no final newline still has a field in flight.
  if (field !== "" || row.length > 0) endRow();

  // A file ending in a real trailing newline parses one clean empty row after
  // the last real one (the newline already closed it) — drop it, not data.
  if (rows.length > 0 && rows[rows.length - 1]!.length === 1 && rows[rows.length - 1]![0] === "") {
    rows.pop();
  }
  return rows;
}

export interface CsvToPdfOptions {
  pageSize?: "a4" | "letter";
  fontSize?: number;
  /** First row rendered as a shaded, bold header repeated on every page. */
  hasHeader?: boolean;
}

/**
 * Renders parsed CSV rows as a paginated table — the same page-by-page
 * drawing textToPdf() uses, not a browser layout engine, so columns are
 * fixed-width (split evenly across the page) and a cell too long for its
 * column is truncated with an ellipsis rather than wrapped or shrunk. Good
 * enough for the short, mostly-numeric-or-short-text cells a spreadsheet
 * export actually has; a cell with a long paragraph in it will lose text —
 * flatten wide/prose-heavy CSVs some other way first.
 */
export async function csvToPdf(rows: string[][], options: CsvToPdfOptions = {}): Promise<Uint8Array> {
  if (rows.length === 0) throw new Error("This CSV has no rows to lay out.");
  const { pageSize = "a4", fontSize = 9, hasHeader = true } = options;
  const [pageWidth, pageHeight] = TEXT_PAGE_SIZES[pageSize];
  const margin = 36;
  const rowHeight = fontSize * 2.2;
  const cellPad = 4;

  const columnCount = Math.max(...rows.map((r) => r.length));
  const tableWidth = pageWidth - margin * 2;
  const colWidth = tableWidth / columnCount;

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  let page: PDFPage = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const [header, ...body] = rows;

  // Redraws the header (unshaded rows call this with header=null and skip
  // it) at the top of every new page — a data table long enough to paginate
  // is exactly the case where losing the column labels partway through
  // would make the rest of the table unreadable.
  function newPage() {
    page = doc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
    if (hasHeader && header) drawRow(header, boldFont, true, true);
  }

  function truncate(text: string, useFont: PDFFont, maxWidth: number): string {
    if (useFont.widthOfTextAtSize(text, fontSize) <= maxWidth) return text;
    const ellipsis = "…";
    let out = text;
    while (out.length > 0 && useFont.widthOfTextAtSize(out + ellipsis, fontSize) > maxWidth) {
      out = out.slice(0, -1);
    }
    return out + ellipsis;
  }

  function drawRow(cells: string[], useFont: PDFFont, shaded: boolean, isHeaderRedraw = false) {
    if (!isHeaderRedraw && y - rowHeight < margin) newPage();
    if (shaded) {
      page.drawRectangle({ x: margin, y: y - rowHeight, width: tableWidth, height: rowHeight, color: rgb(0.93, 0.94, 0.96) });
    }
    for (let c = 0; c < columnCount; c++) {
      const cellX = margin + c * colWidth;
      const text = truncate(cells[c] ?? "", useFont, colWidth - cellPad * 2);
      page.drawText(text, {
        x: cellX + cellPad,
        y: y - rowHeight + (rowHeight - fontSize) / 2,
        size: fontSize,
        font: useFont,
        color: rgb(0.06, 0.08, 0.1),
      });
      page.drawRectangle({ x: cellX, y: y - rowHeight, width: colWidth, height: rowHeight, borderColor: rgb(0.82, 0.84, 0.87), borderWidth: 0.5 });
    }
    y -= rowHeight;
  }

  if (hasHeader && header) drawRow(header, boldFont, true, true);
  for (const dataRow of hasHeader ? body : rows) {
    drawRow(dataRow, font, false);
  }

  return doc.save();
}
