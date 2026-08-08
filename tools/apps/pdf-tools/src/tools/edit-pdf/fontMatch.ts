/**
 * Best-effort font matching for the existing-text patch-and-re-render
 * pipeline (design doc §3). There is no way to recover a PDF's actual
 * embedded font client-side well enough to re-embed it faithfully — this
 * maps pdf.js's own font-family guess for a text run onto the closest of
 * pdf-lib's 14 standard fonts, which is what "best-effort" concretely means
 * here: get serif/sans/mono and bold/italic right, accept that the exact
 * typeface won't match.
 *
 * The returned strings are the literal values pdf-lib's StandardFonts enum
 * uses (e.g. `StandardFonts.TimesRomanBoldItalic === "Times-BoldItalic"`),
 * so they can be handed straight to `doc.embedFont(name)` — see pdf-edit.ts.
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

export function matchStandardFont(fontFamilyHint: string): StandardFontName {
  const hint = fontFamilyHint.toLowerCase();
  const bold = /bold|black|heavy|semibold/.test(hint);
  const italic = /italic|oblique/.test(hint);
  const family: FontFamilyBase = /times|georgia|serif|garamond|minion|cambria|book\s?antiqua/.test(hint)
    ? "Times"
    : /courier|mono|consolas|menlo|typewriter/.test(hint)
      ? "Courier"
      : "Helvetica";

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

/** Web-safe CSS stack approximating a standard font, for the live editor's on-screen preview only — the export uses the real pdf-lib standard font. */
export function standardFontCssStack(font: StandardFontName): string {
  if (font.startsWith("Times")) return `"Times New Roman", Times, serif`;
  if (font.startsWith("Courier")) return `"Courier New", Courier, monospace`;
  return `Helvetica, Arial, sans-serif`;
}

export function isBoldStandardFont(font: StandardFontName): boolean {
  return font.includes("Bold");
}

export function isItalicStandardFont(font: StandardFontName): boolean {
  return font.includes("Italic") || font.includes("Oblique");
}
