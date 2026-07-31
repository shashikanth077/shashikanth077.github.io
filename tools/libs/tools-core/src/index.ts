/**
 * @devtools/tools-core — framework-free tool logic.
 *
 * Nothing in this package imports React. That keeps every tool unit-testable
 * without a DOM renderer, and means a tool could move behind an API later
 * without rewriting its logic.
 */

export * from "./routes.js";
export * from "./brand.js";
export * from "./encoding.js";
export * from "./jwt.js";
export * from "./uuid.js";
export * from "./json.js";
export * from "./markdown.js";
export * from "./files.js";
export * from "./beautify.js";
export * from "./diff.js";
export * from "./units.js";

// Each of the modules below owns a large library (bwip-js, pdf-lib, pdf.js,
// mammoth/jsPDF). They are kept as separate modules — never merged — so the
// bundler emits one chunk per library and a tool only downloads what it calls.
// See the note at the top of qr.ts.
export * from "./qr.js";
export * from "./barcode.js";
export * from "./pdf.js";
export * from "./pdf-render.js";
export * from "./pdf-edit.js";
export * from "./office.js";
export * from "./image.js";
