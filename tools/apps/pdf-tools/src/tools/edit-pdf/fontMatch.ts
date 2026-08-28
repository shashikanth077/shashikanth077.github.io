/**
 * Best-effort font matching for the existing-text patch-and-re-render
 * pipeline (design doc §3). There is no way to recover a PDF's actual
 * embedded font program client-side well enough to re-embed *that exact
 * typeface* faithfully (it's commonly subsetted to only the glyphs the
 * original document happened to use, which would silently break on any
 * character the edit introduces that the original run didn't have) — this
 * maps a text run's font onto the closest of pdf-lib's 14 standard-font
 * *names* (serif/sans/mono, bold/italic), which is what "best-effort"
 * concretely means here.
 *
 * Family comes from keyword-matching the run's font name and pdf.js's
 * generic family guess; weight and slant come from pdf.js's own resolved
 * booleans when available (see the `style` parameter below), because the
 * name alone is not reliable enough to determine them.
 *
 * The returned strings are the literal values pdf-lib's StandardFonts enum
 * uses (e.g. `StandardFonts.TimesRomanBoldItalic === "Times-BoldItalic"`).
 * What actually gets embedded for each name is a real, full-Latin-coverage
 * font program (see embeddedFonts.ts's Arimo/Tinos/Cousine and the
 * `customFontBytes` doc comment on `flattenAnnotations` in pdf-edit.ts) —
 * not pdf-lib's own bare name reference, which different PDF viewers each
 * substitute their own local font for.
 */

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

/**
 * `style`, when supplied, carries pdf.js's own resolved weight/slant for the
 * run (see `resolveRunFont` in EditPdf.tsx). It always wins over the keyword
 * match below, which only ever sees a font *name* and so silently reports
 * regular for any bold/italic font whose name doesn't happen to spell that
 * out — including every font pdf.js could only describe generically.
 */
export function matchStandardFont(fontFamilyHint: string, style?: { bold?: boolean; italic?: boolean }): StandardFontName {
  const hint = fontFamilyHint.toLowerCase();
  const bold = style?.bold ?? /bold|black|heavy|semibold/.test(hint);
  const italic = style?.italic ?? /italic|oblique/.test(hint);

  // "sans-serif" — pdf.js's own generic fallback for any embedded font it
  // can't identify more specifically, which is most real-world documents
  // (anything exported from a resume builder, Google Docs, Word, etc.) —
  // contains "serif" as a literal substring. Checking sans first is not
  // an optimization, it's required: without it every one of those very
  // common documents gets its plain sans-serif body text matched to Times,
  // which is exactly backwards from "best-effort match the original font".
  let family: FontFamilyBase;
  if (/courier|mono|consolas|menlo|typewriter/.test(hint)) {
    family = "Courier";
  } else if (/sans|arial|helvetica|calibri|verdana|tahoma|segoe|roboto|opensans|open\s?sans|lato|inter\b/.test(hint)) {
    family = "Helvetica";
  } else if (/times|georgia|serif|garamond|minion|cambria|book\s?antiqua/.test(hint)) {
    family = "Times";
  } else {
    family = "Helvetica";
  }

  return composeStandardFont(family, bold, italic);
}

export type FontFamilyBase = "Helvetica" | "Times" | "Courier";

export const FONT_FAMILY_OPTIONS: Array<{ value: FontFamilyBase; label: string }> = [
  { value: "Helvetica", label: "Helvetica (sans)" },
  { value: "Times", label: "Times (serif)" },
  { value: "Courier", label: "Courier (mono)" },
];

/** The base family (ignoring weight/style) a standard font name belongs to — the inverse of `composeStandardFont`. Used by the text toolbar's font-family dropdown, which edits family independently from the Bold/Italic toggles. */
export function baseFontFamily(font: StandardFontName): FontFamilyBase {
  if (font.startsWith("Times")) return "Times";
  if (font.startsWith("Courier")) return "Courier";
  return "Helvetica";
}

/** Builds the exact pdf-lib standard-font name for a family + weight/style combination — the inverse of `baseFontFamily`/`isBoldStandardFont`/`isItalicStandardFont`. */
export function composeStandardFont(family: FontFamilyBase, bold: boolean, italic: boolean): StandardFontName {
  if (family === "Times") return bold && italic ? "Times-BoldItalic" : bold ? "Times-Bold" : italic ? "Times-Italic" : "Times-Roman";
  if (family === "Courier") return bold && italic ? "Courier-BoldOblique" : bold ? "Courier-Bold" : italic ? "Courier-Oblique" : "Courier";
  return bold && italic ? "Helvetica-BoldOblique" : bold ? "Helvetica-Bold" : italic ? "Helvetica-Oblique" : "Helvetica";
}

/**
 * CSS font-family for the live editor's on-screen preview. Leads with the
 * `@font-face`s declared in EditPdf.css (PDFEdArimo/Tinos/Cousine) — the
 * exact same font files `embeddedFonts.ts` embeds into the exported PDF —
 * so what's shown while editing matches what comes out, not just an OS's
 * own approximation of "Helvetica"/"Times"/"Courier" (see the
 * `customFontBytes` doc comment on `flattenAnnotations` for why that
 * approximation is what caused a visible mismatch here). The named
 * fallbacks after it only matter for the instant before the custom font
 * finishes loading.
 */
export function standardFontCssStack(font: StandardFontName): string {
  if (font.startsWith("Times")) return `"PDFEdTinos", "Times New Roman", Times, serif`;
  if (font.startsWith("Courier")) return `"PDFEdCousine", "Courier New", Courier, monospace`;
  return `"PDFEdArimo", Helvetica, Arial, sans-serif`;
}

export function isBoldStandardFont(font: StandardFontName): boolean {
  return font.includes("Bold");
}

export function isItalicStandardFont(font: StandardFontName): boolean {
  return font.includes("Italic") || font.includes("Oblique");
}
