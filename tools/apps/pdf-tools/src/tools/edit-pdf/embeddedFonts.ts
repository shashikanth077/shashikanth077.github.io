import type { StandardFontName } from "@devtools/tools-core";

// `new URL(..., import.meta.url)` instead of a plain `?url` import: Vite's
// `?url` transform resolves to a *root-relative* dev-server path (e.g.
// `/src/tools/edit-pdf/fonts/Arimo-Bold.ttf`), which is exactly right when
// this module is served from the same origin as the page — true for the
// assembled production build, but false the moment this remote is loaded
// into the shell's page from its own dev-server port (Module Federation's
// standard multi-port `npm run dev` setup). A root-relative path then
// resolves against the *shell's* origin instead of this file's, 404s, and
// `loadEmbeddedFonts` below used to hand fontkit the 404 page's HTML as if
// it were a font program — surfacing only as fontkit's own opaque "Unknown
// font format", nowhere near this comment. `import.meta.url` is always
// *this module's* actual URL regardless of which origin loaded it, so the
// resolved asset URL is correct in both topologies. Nothing here joins the
// main bundle unless loadEmbeddedFonts() is actually called (see
// EditPdf.tsx's save()), so a PDF with no text edits never fetches them.
const arimoRegular = new URL("./fonts/Arimo-Regular.ttf", import.meta.url).href;
const arimoBold = new URL("./fonts/Arimo-Bold.ttf", import.meta.url).href;
const arimoItalic = new URL("./fonts/Arimo-Italic.ttf", import.meta.url).href;
const arimoBoldItalic = new URL("./fonts/Arimo-BoldItalic.ttf", import.meta.url).href;
const tinosRegular = new URL("./fonts/Tinos-Regular.ttf", import.meta.url).href;
const tinosBold = new URL("./fonts/Tinos-Bold.ttf", import.meta.url).href;
const tinosItalic = new URL("./fonts/Tinos-Italic.ttf", import.meta.url).href;
const tinosBoldItalic = new URL("./fonts/Tinos-BoldItalic.ttf", import.meta.url).href;
const cousineRegular = new URL("./fonts/Cousine-Regular.ttf", import.meta.url).href;
const cousineBold = new URL("./fonts/Cousine-Bold.ttf", import.meta.url).href;
const cousineItalic = new URL("./fonts/Cousine-Italic.ttf", import.meta.url).href;
const cousineBoldItalic = new URL("./fonts/Cousine-BoldItalic.ttf", import.meta.url).href;

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
      const url = FONT_URLS[name];
      const res = await fetch(url);
      // Without this check, a failed fetch (wrong origin, offline, a CDN
      // hiccup) hands fontkit the error response's body — HTML or JSON, not
      // a font program — and fontkit's own error ("Unknown font format")
      // gives no hint that the *real* problem was a failed network request.
      if (!res.ok) throw new Error(`Failed to load font ${name} from ${url}: ${res.status} ${res.statusText}`);
      return [name, await res.arrayBuffer()] as const;
    }),
  );
  return Object.fromEntries(entries) as Partial<Record<StandardFontName, ArrayBuffer>>;
}
