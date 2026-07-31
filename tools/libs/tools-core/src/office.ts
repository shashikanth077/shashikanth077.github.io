/**
 * Word (.docx) conversion.
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
 *
 * PDF → DOCX cannot round-trip. PDF stores positioned glyphs, not paragraphs,
 * so the best available result is extracted text rebuilt into a plain Word
 * document. Styling, columns and tables do not survive. Any site claiming
 * otherwise is either using a commercial engine or overpromising.
 */

import mammoth from "mammoth";
import DOMPurify from "dompurify";

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
