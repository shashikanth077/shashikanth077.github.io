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
  category: "Encoding" | "Formatting" | "Generators" | "Inspection";
  remote: RemoteName;
}

export const toolRoutes: ToolRoute[] = [
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
  const order: ToolRoute["category"][] = ["Encoding", "Formatting", "Generators", "Inspection"];
  return order
    .map((c) => [c, routes.filter((r) => r.category === c)] as [ToolRoute["category"], ToolRoute[]])
    .filter(([, items]) => items.length > 0);
}
