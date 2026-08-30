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
 * generic family guess; weight and slant come from pdf.js's resolved
 * booleans OR-ed with that same keyword match (see the `style` parameter),
 * since either source alone under-reports.
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
 * `style`, when supplied, carries pdf.js's own resolved weight/slant for
 * the run (see `resolveRunFont` in EditPdf.tsx). It is OR-ed with the
 * keyword match rather than replacing it, because each signal fails in a
 * different direction and neither alone is enough:
 *
 *  - the keyword match only ever sees a font *name*, so it reports regular
 *    for any bold/italic font whose name does not spell that out -- which
 *    includes every font pdf.js could only describe generically as
 *    "sans-serif"/"serif".
 *  - pdf.js's booleans come from the embedded font's descriptor flags, and
 *    read false for fonts whose descriptor does not set them even when the
 *    name plainly says otherwise. Re-opening a PDF this editor itself
 *    exported hit exactly that: a run in "Tinos-BoldItalic" came back
 *    bold:false italic:false, and an earlier `??` here let that false win
 *    over the name, silently dropping both styles on every round trip.
 *
 * Either signal saying yes is therefore taken as yes. A name containing
 * "Bold" on a font that is not bold is far rarer than either source
 * under-reporting.
 */
export function matchStandardFont(fontFamilyHint: string, style?: { bold?: boolean; italic?: boolean }): StandardFontName {
  const hint = fontFamilyHint.toLowerCase();
  const bold = (style?.bold ?? false) || /bold|black|heavy|semibold/.test(hint);
  const italic = (style?.italic ?? false) || /italic|oblique/.test(hint);

  // Family is decided in two passes, specific typeface names before generic
  // ones. pdf.js's generic guess is frequently wrong for an embedded font --
  // it labels this editor's own Tinos (a Times clone) "sans-serif" -- and a
  // single combined pass lets that wrong generic win, because "sans-serif"
  // contains the token "sans". Re-opening an edited PDF hit exactly that: a
  // run in Tinos-BoldItalic came back as Helvetica. Matching real names
  // first keeps the informative signal ahead of the unreliable one; the
  // generic pass still covers fonts whose names say nothing useful.
  //
  // Note the generic pass must test mono and sans before serif: the literal
  // string "sans-serif" contains "serif", so checking serif first would send
  // every plain sans-serif document (anything out of Word, Google Docs, a
  // resume builder) to Times -- backwards from matching the original.
  const family: FontFamilyBase =
    matchNamedFamily(hint) ?? matchGenericFamily(hint) ?? "Helvetica";

  return composeStandardFont(family, bold, italic);
}

/** Recognises an actual typeface name (never a generic CSS family word). */
function matchNamedFamily(hint: string): FontFamilyBase | null {
  if (/courier|cousine|consolas|menlo|monaco|typewriter/.test(hint)) return "Courier";
  if (/arial|helvetica|arimo|calibri|verdana|tahoma|segoe|roboto|open\s?sans|lato|inter\b/.test(hint)) return "Helvetica";
  if (/times|tinos|georgia|garamond|minion|cambria|book\s?antiqua/.test(hint)) return "Times";
  return null;
}

/** Falls back to pdf.js's generic CSS family word. Order matters -- see matchStandardFont. */
function matchGenericFamily(hint: string): FontFamilyBase | null {
  if (/mono/.test(hint)) return "Courier";
  if (/sans/.test(hint)) return "Helvetica";
  if (/serif/.test(hint)) return "Times";
  return null;
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
