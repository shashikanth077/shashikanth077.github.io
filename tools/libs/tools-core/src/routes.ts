/**
 * Single source of truth for every tool route.
 *
 * Consumed by three places that must never drift apart:
 *   1. the shell's router          (apps/shell/src/App.tsx)
 *   2. the remote's route table    (apps/utility-tools/src/expose/ToolRoutes.tsx)
 *   3. the static prerender + sitemap generator (tools/scripts/postbuild.mjs)
 *
 * Same pattern as src/constants.js in the portfolio — define once, import everywhere.
 */

/** Public base path. This repo is a GitHub user-page, so the platform sits at /tools. */
export const BASE_PATH = "/tools";

export const SITE_ORIGIN = "https://shashikanth077.github.io";

/** Which micro-frontend owns a route. Only `utility` ships in slice 1. */
export type RemoteName = "utility" | "image" | "pdf";

export interface ToolRoute {
  /** URL segment under BASE_PATH — also the prerendered directory name. */
  slug: string;
  /** Display name in nav, cards and <h1>. */
  name: string;
  /** One-line summary shown on the tool card. */
  tagline: string;
  /** <meta name="description"> — aim for 140-160 chars. */
  description: string;
  /** Feeds <meta name="keywords"> and the JSON-LD keywords field. */
  keywords: string[];
  /** Grouping in the nav. */
  category: "PDF" | "Images" | "Encoding" | "Formatting" | "Generators" | "Inspection";
  remote: RemoteName;
  /**
   * Shown as a badge on the tool card and a note in the tool itself.
   * Used where the browser-only implementation has a real limitation the user
   * should know about before they rely on the output.
   */
  caveat?: string;
}

export const toolRoutes: ToolRoute[] = [
  /* ---------------- PDF ---------------- */
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    tagline: "Combine several PDFs into one, in any order.",
    description:
      "Combine multiple PDF files into a single document and reorder them before merging. Runs entirely in your browser — your files are never uploaded.",
    keywords: ["merge pdf", "combine pdf", "join pdf files", "pdf merger free"],
    category: "PDF",
    remote: "pdf",
  },
  {
    slug: "split-pdf",
    name: "Split PDF",
    tagline: "Extract page ranges, or burst into single pages.",
    description:
      "Split a PDF by page ranges or separate every page into its own file, then download the results individually or as a ZIP. Nothing leaves your device.",
    keywords: ["split pdf", "extract pdf pages", "separate pdf", "pdf splitter"],
    category: "PDF",
    remote: "pdf",
  },
  {
    slug: "remove-pdf-pages",
    name: "Delete PDF Pages",
    tagline: "Pick pages to keep or remove, visually.",
    description:
      "Remove unwanted pages from a PDF by clicking page thumbnails, or keep only a selection. Page content is preserved exactly — nothing is re-encoded.",
    keywords: ["delete pdf pages", "remove pages from pdf", "pdf page remover"],
    category: "PDF",
    remote: "pdf",
  },
  {
    slug: "rotate-pdf",
    name: "Rotate PDF",
    tagline: "Turn some or all pages 90, 180 or 270 degrees.",
    description:
      "Fix sideways or upside-down scans by rotating selected pages of a PDF. The rotation is stored as page metadata, so quality is untouched.",
    keywords: ["rotate pdf", "turn pdf pages", "fix pdf orientation"],
    category: "PDF",
    remote: "pdf",
  },
  {
    slug: "images-to-pdf",
    name: "Images to PDF",
    tagline: "Turn JPG, PNG or WebP files into one PDF.",
    description:
      "Combine photos and scans into a single PDF with a choice of page size and fit. Images are embedded at full quality without re-compression where possible.",
    keywords: ["jpg to pdf", "png to pdf", "images to pdf", "photo to pdf"],
    category: "PDF",
    remote: "pdf",
  },
  {
    slug: "pdf-to-images",
    name: "PDF to Images",
    tagline: "Render every page as a PNG or JPEG.",
    description:
      "Convert PDF pages into PNG or JPEG images at a resolution you choose, then download them individually or as a ZIP. Rendering happens in your browser.",
    keywords: ["pdf to jpg", "pdf to png", "pdf to image", "convert pdf to picture"],
    category: "PDF",
    remote: "pdf",
  },
  {
    slug: "pdf-to-text",
    name: "PDF to Text",
    tagline: "Pull the text content out of a PDF.",
    description:
      "Extract selectable text from a PDF, page by page, and copy or download it as a plain text file. Works on text PDFs, not scanned images.",
    keywords: ["pdf to text", "extract text from pdf", "pdf text extractor"],
    category: "PDF",
    remote: "pdf",
    caveat: "Text PDFs only — a scanned page has no text to extract without OCR.",
  },
  {
    slug: "pdf-to-word",
    name: "PDF to Word",
    tagline: "Rebuild a PDF's text as an editable .docx.",
    description:
      "Extract the text from a PDF and rebuild it as an editable Word document. Best suited to single-column text documents rather than complex layouts.",
    keywords: ["pdf to word", "pdf to docx", "convert pdf to word free", "pdf to doc"],
    category: "PDF",
    remote: "pdf",
    caveat:
      "Text only. PDF stores positioned glyphs rather than paragraphs, so fonts, columns and tables will not survive.",
  },
  {
    slug: "word-to-pdf",
    name: "Word to PDF",
    tagline: "Convert a .docx into a PDF you can share.",
    description:
      "Convert Word documents to PDF in your browser, with a choice between a one-click download and your browser's own print engine for the best text quality.",
    keywords: ["word to pdf", "docx to pdf", "convert doc to pdf free"],
    category: "PDF",
    remote: "pdf",
    caveat: "Word's exact pagination cannot be reproduced in a browser — expect layout to shift.",
  },
  {
    slug: "word-to-html",
    name: "Word to HTML",
    tagline: "Convert a .docx into clean, semantic HTML.",
    description:
      "Turn a Word document into clean HTML, mapping Word's heading and quote styles onto real semantic tags. Output is sanitised before display.",
    keywords: ["word to html", "docx to html", "convert word to web page"],
    category: "PDF",
    remote: "pdf",
  },
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    tagline: "Shrink scan-heavy PDFs by flattening pages to images.",
    description:
      "Reduce the size of image-heavy or scanned PDFs by re-rendering each page as a compressed image. Best for scans; not suitable for text documents.",
    keywords: ["compress pdf", "reduce pdf size", "shrink pdf", "make pdf smaller"],
    category: "PDF",
    remote: "pdf",
    caveat:
      "Flattens pages to images, so text stops being selectable — and a text-only PDF will usually get bigger, not smaller.",
  },

  /* ---------------- Images ---------------- */
  {
    slug: "image-converter",
    name: "Image Converter",
    tagline: "Convert between JPG, PNG, WebP and AVIF.",
    description:
      "Convert images between JPG, PNG, WebP and AVIF with control over quality. Batch-convert many files at once, entirely inside your browser.",
    keywords: ["jpg to png", "png to jpg", "webp converter", "image converter free"],
    category: "Images",
    remote: "image",
  },
  {
    slug: "image-resize",
    name: "Image Resizer",
    tagline: "Resize by pixels or percentage, keeping aspect ratio.",
    description:
      "Resize one or many images by width, height or percentage, with aspect ratio locked by default. No upload, no quality loss beyond the resize itself.",
    keywords: ["resize image", "image resizer", "change image size", "bulk resize photos"],
    category: "Images",
    remote: "image",
  },
  {
    slug: "image-compress",
    name: "Image Compressor",
    tagline: "Hit a target file size without guessing quality.",
    description:
      "Compress JPG and WebP images to a target file size. Quality is found by binary search rather than a fixed guess, so you keep as much detail as fits.",
    keywords: ["compress image", "reduce image size", "image optimizer", "compress jpeg"],
    category: "Images",
    remote: "image",
  },

  /* ---------------- Utilities ---------------- */
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    tagline: "Inspect a JSON Web Token's header, payload and expiry.",
    description:
      "Decode a JSON Web Token in your browser. Reads the header, payload, issued-at and expiry. Your token is never uploaded or transmitted anywhere.",
    keywords: ["jwt decoder", "decode jwt online", "json web token", "jwt parser"],
    category: "Inspection",
    remote: "utility",
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    tagline: "Generate cryptographically random v4 UUIDs in bulk.",
    description:
      "Generate RFC 4122 version 4 UUIDs using the browser's crypto API. Create one or thousands at a time, with optional uppercase and braces formatting.",
    keywords: ["uuid generator", "guid generator", "uuid v4", "random uuid"],
    category: "Generators",
    remote: "utility",
  },
  {
    slug: "base64-encoder",
    name: "Base64 Encoder / Decoder",
    tagline: "Convert text and files to and from Base64.",
    description:
      "Encode text to Base64 or decode it back, with full Unicode support and URL-safe mode. Runs entirely in your browser — nothing is sent to a server.",
    keywords: ["base64 encode", "base64 decode", "base64 converter", "base64url"],
    category: "Encoding",
    remote: "utility",
  },
  {
    slug: "url-encoder",
    name: "URL Encoder / Decoder",
    tagline: "Percent-encode and decode URLs and query strings.",
    description:
      "Percent-encode or decode URLs, query parameters and path segments. Supports both full-component and full-URI encoding modes. Works offline in your browser.",
    keywords: ["url encoder", "url decoder", "percent encoding", "uri encode"],
    category: "Encoding",
    remote: "utility",
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    tagline: "Pretty-print, minify and sort JSON.",
    description:
      "Format messy JSON with configurable indentation, minify it, or sort keys alphabetically. Parsing happens locally, so production data never leaves your machine.",
    keywords: ["json formatter", "json beautifier", "json pretty print", "minify json"],
    category: "Formatting",
    remote: "utility",
  },
  {
    slug: "json-validator",
    name: "JSON Schema Validator",
    tagline: "Validate a JSON document against a JSON Schema.",
    description:
      "Check a JSON document against a JSON Schema (draft 2020-12) and get precise, path-level error messages. Validation runs in your browser using Ajv.",
    keywords: ["json schema validator", "validate json", "ajv", "json schema"],
    category: "Inspection",
    remote: "utility",
  },
  {
    slug: "markdown-preview",
    name: "Markdown Preview",
    tagline: "Render Markdown to sanitised HTML as you type.",
    description:
      "Write Markdown and see the rendered result live, with the HTML source available to copy. Output is sanitised with DOMPurify before it is displayed.",
    keywords: ["markdown preview", "markdown to html", "md renderer", "markdown editor"],
    category: "Formatting",
    remote: "utility",
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    tagline: "Turn any text or URL into a downloadable QR code.",
    description:
      "Generate a QR code from text, a URL, WiFi credentials or contact details. Adjust size and error-correction level, then download as PNG or SVG.",
    keywords: ["qr code generator", "create qr code", "qr code png", "free qr code"],
    category: "Generators",
    remote: "utility",
  },
  {
    slug: "barcode-generator",
    name: "Barcode Generator",
    tagline: "Create Code 128, EAN, UPC and other linear barcodes.",
    description:
      "Generate linear barcodes including Code 128, EAN-13, UPC-A and Code 39. Renders on a canvas in your browser and downloads as a PNG.",
    keywords: ["barcode generator", "code 128", "ean 13 barcode", "upc barcode"],
    category: "Generators",
    remote: "utility",
  },
];

/**
 * Absolute site path, e.g. "/tools/jwt-decoder".
 *
 * For canonical URLs, sitemaps and plain <a href> only — NOT for React Router
 * <Link to>. The router is mounted with basename=BASE_PATH and resolves `to`
 * relative to it, so passing this would yield "/tools/tools/jwt-decoder".
 */
export function toolPath(slug: string): string {
  return `${BASE_PATH}/${slug}`;
}

/** Router-relative path for <Link to> / <NavLink to>. The basename adds BASE_PATH. */
export function routerPath(slug: string): string {
  return `/${slug}`;
}

/** Router-relative home. */
export const ROUTER_HOME = "/";

/** Fully-qualified canonical URL, used by the prerenderer and sitemap. */
export function toolUrl(slug: string): string {
  return `${SITE_ORIGIN}${toolPath(slug)}`;
}

export function findTool(slug: string): ToolRoute | undefined {
  return toolRoutes.find((t) => t.slug === slug);
}

/** Nav grouping — preserves the category order declared above. */
export function groupByCategory(
  routes: ToolRoute[] = toolRoutes,
): Array<[ToolRoute["category"], ToolRoute[]]> {
  const order: ToolRoute["category"][] = [
    "PDF",
    "Images",
    "Encoding",
    "Formatting",
    "Generators",
    "Inspection",
  ];
  return order
    .map((c) => [c, routes.filter((r) => r.category === c)] as [ToolRoute["category"], ToolRoute[]])
    .filter(([, items]) => items.length > 0);
}
