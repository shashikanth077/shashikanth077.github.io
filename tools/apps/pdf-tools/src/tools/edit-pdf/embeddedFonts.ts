import type { StandardFontName } from "@devtools/tools-core";

// Vite emits each of these as its own hashed asset URL — nothing here joins
// the main bundle unless loadEmbeddedFonts() is actually called (see
// EditPdf.tsx's save()), so a PDF with no text edits never fetches them.
import arimoRegular from "./fonts/Arimo-Regular.ttf?url";
import arimoBold from "./fonts/Arimo-Bold.ttf?url";
import arimoItalic from "./fonts/Arimo-Italic.ttf?url";
import arimoBoldItalic from "./fonts/Arimo-BoldItalic.ttf?url";
import tinosRegular from "./fonts/Tinos-Regular.ttf?url";
import tinosBold from "./fonts/Tinos-Bold.ttf?url";
import tinosItalic from "./fonts/Tinos-Italic.ttf?url";
import tinosBoldItalic from "./fonts/Tinos-BoldItalic.ttf?url";
import cousineRegular from "./fonts/Cousine-Regular.ttf?url";
import cousineBold from "./fonts/Cousine-Bold.ttf?url";
import cousineItalic from "./fonts/Cousine-Italic.ttf?url";
import cousineBoldItalic from "./fonts/Cousine-BoldItalic.ttf?url";

/**
 * Real, redistributable (OFL) font programs standing in for pdf-lib's 14
 * named standard fonts — Arimo/Tinos/Cousine are metric-compatible clones
 * of Arial/Times New Roman/Courier New. See LICENSE.txt in ./fonts and the
 * `customFontBytes` doc comment on `flattenAnnotations` for why embedding
 * an actual font program (instead of just the "Helvetica" name pdf-lib's
 * StandardFonts use) is what actually fixes the mismatch between this
 * editor's on-screen preview and what different PDF viewers render.
 */
const FONT_URLS: Record<StandardFontName, string> = {
  Helvetica: arimoRegular,
  "Helvetica-Bold": arimoBold,
  "Helvetica-Oblique": arimoItalic,
  "Helvetica-BoldOblique": arimoBoldItalic,
  "Times-Roman": tinosRegular,
  "Times-Bold": tinosBold,
  "Times-Italic": tinosItalic,
  "Times-BoldItalic": tinosBoldItalic,
  Courier: cousineRegular,
  "Courier-Bold": cousineBold,
  "Courier-Oblique": cousineItalic,
  "Courier-BoldOblique": cousineBoldItalic,
};

/**
 * Fetches the font bytes for each distinct `StandardFontName` in `names` —
 * pass `flattenAnnotations`'s result straight through as its `customFontBytes`
 * argument. Only the names actually in use are fetched (a document with no
 * text edits, or text in only one font, never pulls the other 11).
 */
export async function loadEmbeddedFonts(
  names: Iterable<StandardFontName>,
): Promise<Partial<Record<StandardFontName, ArrayBuffer>>> {
  const unique = [...new Set(names)];
  const entries = await Promise.all(
    unique.map(async (name) => {
      const res = await fetch(FONT_URLS[name]);
      return [name, await res.arrayBuffer()] as const;
    }),
  );
  return Object.fromEntries(entries) as Partial<Record<StandardFontName, ArrayBuffer>>;
}
