import { useEffect, useState } from "react";

/**
 * Forces a re-render whenever a `@font-face` finishes loading anywhere on
 * the page. Needed because the editor's custom fonts (PDFEdArimo/Tinos/
 * Cousine — see EditPdf.css and fontMatch.ts's `standardFontCssStack`) load
 * over the network, unlike the plain OS font stack they replaced.
 *
 * `measureText.ts`'s canvas measurement (used for the text annotation's
 * selection outline and the floating toolbar's position — see
 * `textAnnotationScreenBox`) is synchronous and does *not* wait for a
 * loading web font: if it runs before PDFEdArimo has finished downloading,
 * `ctx.measureText()` silently measures against whatever fallback font in
 * the CSS stack is *already* available (e.g. the OS's own Arial/Helvetica),
 * not the one that will actually end up rendering. The box gets computed
 * once, from that wrong, usually-narrower measurement, and never
 * automatically recomputes once the real font swaps in a moment later —
 * confirmed as a real bug (reported: existing-text patches rendering
 * visibly clipped/truncated). Including this hook's return value in a
 * component that calls `textAnnotationScreenBox` (directly or via
 * `getAnnotationScreenBox`) means a `loadingdone` event triggers a
 * re-render, which recomputes the box from fresh (now-correct) metrics.
 */
export function useFontLoadTick(): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    document.fonts.addEventListener("loadingdone", bump);
    return () => document.fonts.removeEventListener("loadingdone", bump);
  }, []);

  return tick;
}

const FONT_CSS_STRINGS = [
  '400 16px "PDFEdArimo"',
  '700 16px "PDFEdArimo"',
  'italic 400 16px "PDFEdArimo"',
  'italic 700 16px "PDFEdArimo"',
  '400 16px "PDFEdTinos"',
  '700 16px "PDFEdTinos"',
  'italic 400 16px "PDFEdTinos"',
  'italic 700 16px "PDFEdTinos"',
  '400 16px "PDFEdCousine"',
  '700 16px "PDFEdCousine"',
  'italic 400 16px "PDFEdCousine"',
  'italic 700 16px "PDFEdCousine"',
];

/**
 * Kicks off loading every custom font variant as soon as a PDF is open —
 * *before* the user has clicked any existing text — so the network fetch
 * (see EditPdf.css's `@font-face` rules) has a head start on the moment
 * `measureText`/`<text>` actually need it. Doesn't wait for completion;
 * `useFontLoadTick` is what makes a late-arriving font correct itself.
 * Safe to call repeatedly — `document.fonts.load` no-ops once a font is
 * already loaded or loading.
 */
export function preloadEditorFonts(): void {
  for (const spec of FONT_CSS_STRINGS) {
    document.fonts.load(spec).catch(() => {
      // A font failing to load (offline, blocked request) just means the
      // CSS stack's next fallback keeps being used — not fatal.
    });
  }
}
