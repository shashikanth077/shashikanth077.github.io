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

/** Which micro-frontend owns a route. */
export type RemoteName = "utility" | "image" | "pdf";

/**
 * Tool groupings, shown as the top-level menu items in the header.
 * Each toolkit maps to a distinct color in the design system.
 */
export type Toolkit = "pdf" | "image" | "qr" | "dev";

export const TOOLKIT_META: Record<Toolkit, { label: string; tagline: string; icon: string }> = {
  pdf: {
    label: "PDF Toolkit",
    tagline: "Merge, split, convert, compress and unlock PDF files — everything runs in your browser.",
    icon: "📄",
  },
  image: {
    label: "Image Toolkit",
    tagline: "Convert, resize and compress images without uploading them anywhere.",
    icon: "🖼️",
  },
  qr: {
    label: "QR & Barcode",
    tagline: "Generate QR codes and linear barcodes, then download as PNG or SVG.",
    icon: "📱",
  },
  dev: {
    label: "Developer Toolkit",
    tagline: "JSON, JWT, encoding and format utilities for people who write code.",
    icon: "⚡",
  },
};

/** Sub-grouping within a toolkit's menu — the mega-menu columns and sidebar sections. */
export type ToolCategory =
  | "Organize"
  | "Convert"
  | "Optimize"
  | "Security"
  | "Transform"
  | "Encoding"
  | "Formatting"
  | "Inspection"
  | "Generators"
  | "Utilities";

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
  /** Which toolkit group this tool belongs to — determines menu placement and color. */
  toolkit: Toolkit;
  /** Grouping within the toolkit's menu. */
  category: ToolCategory;
  remote: RemoteName;
  /** Icon character shown on the tool card inside a colored square. */
  icon: string;
  /**
   * Shown as a badge on the tool card and a note in the tool itself.
   * Used where the browser-only implementation has a real limitation the user
   * should know about before they rely on the output.
   */
  caveat?: string;
}

export const toolRoutes: ToolRoute[] = [
  /* ================ PDF Toolkit ================ */
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    tagline: "Combine several PDFs into one, in any order.",
    description:
      "Combine multiple PDF files into a single document and reorder them before merging. Runs entirely in your browser — your files are never uploaded.",
    keywords: ["merge pdf", "combine pdf", "join pdf files", "pdf merger free"],
    toolkit: "pdf",
    category: "Organize",
    remote: "pdf",
    icon: "📎",
  },
  {
    slug: "split-pdf",
    name: "Split PDF",
    tagline: "Extract page ranges, or burst into single pages.",
    description:
      "Split a PDF by page ranges or separate every page into its own file, then download the results individually or as a ZIP. Nothing leaves your device.",
    keywords: ["split pdf", "extract pdf pages", "separate pdf", "pdf splitter"],
    toolkit: "pdf",
    category: "Organize",
    remote: "pdf",
    icon: "✂️",
  },
  {
    slug: "remove-pdf-pages",
    name: "Delete PDF Pages",
    tagline: "Pick pages to keep or remove, visually.",
    description:
      "Remove unwanted pages from a PDF by clicking page thumbnails, or keep only a selection. Page content is preserved exactly — nothing is re-encoded.",
    keywords: ["delete pdf pages", "remove pages from pdf", "pdf page remover"],
    toolkit: "pdf",
    category: "Organize",
    remote: "pdf",
    icon: "🗑️",
  },
  {
    slug: "rotate-pdf",
    name: "Rotate PDF",
    tagline: "Turn some or all pages 90, 180 or 270 degrees.",
    description:
      "Fix sideways or upside-down scans by rotating selected pages of a PDF. The rotation is stored as page metadata, so quality is untouched.",
    keywords: ["rotate pdf", "turn pdf pages", "fix pdf orientation"],
    toolkit: "pdf",
    category: "Organize",
    remote: "pdf",
    icon: "🔄",
  },
  {
    slug: "images-to-pdf",
    name: "Images to PDF",
    tagline: "Turn JPG, PNG or WebP files into one PDF.",
    description:
      "Combine photos and scans into a single PDF with a choice of page size and fit. Images are embedded at full quality without re-compression where possible.",
    keywords: ["jpg to pdf", "png to pdf", "images to pdf", "photo to pdf"],
    toolkit: "pdf",
    category: "Convert",
    remote: "pdf",
    icon: "🖼️",
  },
  {
    slug: "pdf-to-images",
    name: "PDF to Images",
    tagline: "Render every page as a PNG or JPEG.",
    description:
      "Convert PDF pages into PNG or JPEG images at a resolution you choose, then download them individually or as a ZIP. Rendering happens in your browser.",
    keywords: ["pdf to jpg", "pdf to png", "pdf to image", "convert pdf to picture"],
    toolkit: "pdf",
    category: "Convert",
    remote: "pdf",
    icon: "📷",
  },
  {
    slug: "pdf-to-text",
    name: "PDF to Text",
    tagline: "Pull the text content out of a PDF.",
    description:
      "Extract selectable text from a PDF, page by page, and copy or download it as a plain text file. Works on text PDFs, not scanned images.",
    keywords: ["pdf to text", "extract text from pdf", "pdf text extractor"],
    toolkit: "pdf",
    category: "Convert",
    remote: "pdf",
    icon: "📝",
    caveat: "Text PDFs only — a scanned page has no text to extract without OCR.",
  },
  {
    slug: "pdf-to-word",
    name: "PDF to Word",
    tagline: "Rebuild a PDF's text as an editable .docx.",
    description:
      "Extract the text from a PDF and rebuild it as an editable Word document. Best suited to single-column text documents rather than complex layouts.",
    keywords: ["pdf to word", "pdf to docx", "convert pdf to word free", "pdf to doc"],
    toolkit: "pdf",
    category: "Convert",
    remote: "pdf",
    icon: "📃",
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
    toolkit: "pdf",
    category: "Convert",
    remote: "pdf",
    icon: "📄",
    caveat: "Word's exact pagination cannot be reproduced in a browser — expect layout to shift.",
  },
  {
    slug: "word-to-html",
    name: "Word to HTML",
    tagline: "Convert a .docx into clean, semantic HTML.",
    description:
      "Turn a Word document into clean HTML, mapping Word's heading and quote styles onto real semantic tags. Output is sanitised before display.",
    keywords: ["word to html", "docx to html", "convert word to web page"],
    toolkit: "pdf",
    category: "Convert",
    remote: "pdf",
    icon: "🌐",
  },
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    tagline: "Shrink scan-heavy PDFs by flattening pages to images.",
    description:
      "Reduce the size of image-heavy or scanned PDFs by re-rendering each page as a compressed image. Best for scans; not suitable for text documents.",
    keywords: ["compress pdf", "reduce pdf size", "shrink pdf", "make pdf smaller"],
    toolkit: "pdf",
    category: "Optimize",
    remote: "pdf",
    icon: "📦",
    caveat:
      "Flattens pages to images, so text stops being selectable — and a text-only PDF will usually get bigger, not smaller.",
  },
  {
    slug: "unlock-pdf",
    name: "Unlock PDF",
    tagline: "Remove print, copy and edit restrictions from a locked PDF — free, no upload.",
    description:
      "Free online PDF unlocker that removes owner-password restrictions (no-print, no-copy, no-edit flags) entirely in your browser. " +
      "No file is ever uploaded to a server — your document stays private. " +
      "Drop a permission-locked PDF, click Unlock, and download an unrestricted copy in seconds.",
    keywords: [
      "unlock pdf",
      "remove pdf password",
      "pdf unlocker",
      "remove pdf restrictions",
      "pdf permission remover",
      "remove pdf print restriction",
      "remove pdf copy restriction",
      "pdf unlock online free",
      "unlock pdf without password",
      "pdf restriction remover",
    ],
    toolkit: "pdf",
    category: "Security",
    remote: "pdf",
    icon: "🔓",
    caveat:
      "Owner-password restrictions (no-print, no-copy, no-edit) are removed without a password. " +
      "Open-password PDFs can be unlocked by entering the password — the output is rebuilt from page images, so text stops being selectable.",
  },

  /* ================ Image Toolkit ================ */
  {
    slug: "image-converter",
    name: "Image Converter",
    tagline: "Convert between JPG, PNG, WebP and AVIF.",
    description:
      "Convert images between JPG, PNG, WebP and AVIF with control over quality. Batch-convert many files at once, entirely inside your browser.",
    keywords: ["jpg to png", "png to jpg", "webp converter", "image converter free"],
    toolkit: "image",
    category: "Convert",
    remote: "image",
    icon: "🔀",
  },
  {
    slug: "image-resize",
    name: "Image Resizer",
    tagline: "Resize by pixels or percentage, keeping aspect ratio.",
    description:
      "Resize one or many images by width, height or percentage, with aspect ratio locked by default. No upload, no quality loss beyond the resize itself.",
    keywords: ["resize image", "image resizer", "change image size", "bulk resize photos"],
    toolkit: "image",
    category: "Transform",
    remote: "image",
    icon: "📐",
  },
  {
    slug: "image-compress",
    name: "Image Compressor",
    tagline: "Hit a target file size without guessing quality.",
    description:
      "Compress JPG and WebP images to a target file size. Quality is found by binary search rather than a fixed guess, so you keep as much detail as fits.",
    keywords: ["compress image", "reduce image size", "image optimizer", "compress jpeg"],
    toolkit: "image",
    category: "Optimize",
    remote: "image",
    icon: "💎",
  },

  /* ================ QR & Barcode ================ */
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    tagline: "Turn any text or URL into a downloadable QR code.",
    description:
      "Generate a QR code from text, a URL, WiFi credentials or contact details. Adjust size and error-correction level, then download as PNG or SVG.",
    keywords: ["qr code generator", "create qr code", "qr code png", "free qr code"],
    toolkit: "qr",
    category: "Generators",
    remote: "utility",
    icon: "▣",
  },
  {
    slug: "barcode-generator",
    name: "Barcode Generator",
    tagline: "Create Code 128, EAN, UPC and other linear barcodes.",
    description:
      "Generate linear barcodes including Code 128, EAN-13, UPC-A and Code 39. Renders on a canvas in your browser and downloads as a PNG.",
    keywords: ["barcode generator", "code 128", "ean 13 barcode", "upc barcode"],
    toolkit: "qr",
    category: "Generators",
    remote: "utility",
    icon: "⊞",
  },

  /* ================ Developer Toolkit ================ */
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    tagline: "Inspect a JSON Web Token's header, payload and expiry.",
    description:
      "Decode a JSON Web Token in your browser. Reads the header, payload, issued-at and expiry. Your token is never uploaded or transmitted anywhere.",
    keywords: ["jwt decoder", "decode jwt online", "json web token", "jwt parser"],
    toolkit: "dev",
    category: "Inspection",
    remote: "utility",
    icon: "🔑",
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    tagline: "Generate cryptographically random v4 UUIDs in bulk.",
    description:
      "Generate RFC 4122 version 4 UUIDs using the browser's crypto API. Create one or thousands at a time, with optional uppercase and braces formatting.",
    keywords: ["uuid generator", "guid generator", "uuid v4", "random uuid"],
    toolkit: "dev",
    category: "Utilities",
    remote: "utility",
    icon: "🆔",
  },
  {
    slug: "base64-encoder",
    name: "Base64 Encoder / Decoder",
    tagline: "Convert text and files to and from Base64.",
    description:
      "Encode text to Base64 or decode it back, with full Unicode support and URL-safe mode. Runs entirely in your browser — nothing is sent to a server.",
    keywords: ["base64 encode", "base64 decode", "base64 converter", "base64url"],
    toolkit: "dev",
    category: "Encoding",
    remote: "utility",
    icon: "🔤",
  },
  {
    slug: "url-encoder",
    name: "URL Encoder / Decoder",
    tagline: "Percent-encode and decode URLs and query strings.",
    description:
      "Percent-encode or decode URLs, query parameters and path segments. Supports both full-component and full-URI encoding modes. Works offline in your browser.",
    keywords: ["url encoder", "url decoder", "percent encoding", "uri encode"],
    toolkit: "dev",
    category: "Encoding",
    remote: "utility",
    icon: "🔗",
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    tagline: "Pretty-print, minify and sort JSON.",
    description:
      "Format messy JSON with configurable indentation, minify it, or sort keys alphabetically. Parsing happens locally, so production data never leaves your machine.",
    keywords: ["json formatter", "json beautifier", "json pretty print", "minify json"],
    toolkit: "dev",
    category: "Formatting",
    remote: "utility",
    icon: "{ }",
  },
  {
    slug: "json-validator",
    name: "JSON Schema Validator",
    tagline: "Validate a JSON document against a JSON Schema.",
    description:
      "Check a JSON document against a JSON Schema (draft 2020-12) and get precise, path-level error messages. Validation runs in your browser using Ajv.",
    keywords: ["json schema validator", "validate json", "ajv", "json schema"],
    toolkit: "dev",
    category: "Inspection",
    remote: "utility",
    icon: "✓",
  },
  {
    slug: "markdown-preview",
    name: "Markdown Preview",
    tagline: "Render Markdown to sanitised HTML as you type.",
    description:
      "Write Markdown and see the rendered result live, with the HTML source available to copy. Output is sanitised with DOMPurify before it is displayed.",
    keywords: ["markdown preview", "markdown to html", "md renderer", "markdown editor"],
    toolkit: "dev",
    category: "Formatting",
    remote: "utility",
    icon: "M↓",
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

/**
 * Groups routes by category, preserving each category's first-appearance
 * order in `routes` rather than a hardcoded list — so declaring a new tool in
 * its right place in `toolRoutes` is the only thing that's ever needed; there
 * is no second ordering list to keep in sync.
 */
export function groupByCategory(routes: ToolRoute[]): Array<[ToolCategory, ToolRoute[]]> {
  const order: ToolCategory[] = [];
  const byCategory = new Map<ToolCategory, ToolRoute[]>();

  for (const route of routes) {
    if (!byCategory.has(route.category)) {
      byCategory.set(route.category, []);
      order.push(route.category);
    }
    byCategory.get(route.category)!.push(route);
  }

  return order.map((category) => [category, byCategory.get(category)!]);
}

export function routesFor(toolkit: Toolkit): ToolRoute[] {
  return toolRoutes.filter((r) => r.toolkit === toolkit);
}

/** The header menus: toolkit → its categories → its routes. */
export function groupByToolkit(): Array<[Toolkit, Array<[ToolCategory, ToolRoute[]]>]> {
  return (["pdf", "image", "qr", "dev"] as const).map((toolkit) => [
    toolkit,
    groupByCategory(routesFor(toolkit)),
  ]);
}
