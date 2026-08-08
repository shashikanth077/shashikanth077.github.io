/**
 * Screen ⇄ PDF coordinate conversion, shared by every element renderer and
 * the page orchestrator.
 *
 * pdf-lib coordinates are bottom-left origin, in PostScript points.
 * The SVG overlay uses top-left origin, in screen pixels at RENDER_SCALE.
 * These two functions are the only place that transformation lives.
 */

export const RENDER_SCALE = 1.5;

export interface RenderedPage {
  pageNumber: number;
  /** Pixel size of the rendered canvas image. */
  screenWidth: number;
  screenHeight: number;
  /** Natural PDF page size in points (72pt = 1 inch). */
  pdfWidth: number;
  pdfHeight: number;
  dataUrl: string;
}

export function screenToPdf(page: RenderedPage, sx: number, sy: number): { x: number; y: number } {
  return {
    x: sx / RENDER_SCALE,
    y: page.pdfHeight - sy / RENDER_SCALE,
  };
}

export function pdfToScreen(page: RenderedPage, x: number, y: number): { sx: number; sy: number } {
  return {
    sx: x * RENDER_SCALE,
    sy: (page.pdfHeight - y) * RENDER_SCALE,
  };
}

/** Converts a PDF-space axis-aligned box (bottom-left origin) to a screen-space rect (top-left origin). */
export function boxToScreen(
  page: RenderedPage,
  box: { x: number; y: number; width: number; height: number },
): { sx: number; sy: number; width: number; height: number } {
  const topLeft = pdfToScreen(page, box.x, box.y + box.height);
  return { sx: topLeft.sx, sy: topLeft.sy, width: box.width * RENDER_SCALE, height: box.height * RENDER_SCALE };
}

/**
 * Screen-space coordinates from pdfToScreen()/boxToScreen()/
 * getAnnotationScreenBox() are all in the SVG's *nominal* viewBox units
 * (page.screenWidth/Height) — correct for anything drawn inside the SVG,
 * since the browser's viewBox transform scales those to real pixels for
 * free. Anything positioned outside the SVG via plain CSS left/top (like
 * the floating ElementToolbar) needs those nominal units converted to real
 * ones by hand first, because the page frame can render smaller than its
 * nominal pixel size (responsive max-width:100% shrinking — see
 * .pdfed__pageframe in EditPdf.css). `scale` is
 * `svgElement.getBoundingClientRect().width / page.screenWidth`.
 */
export function scaleScreenBox<T extends { sx: number; sy: number; width: number; height: number }>(box: T, scale: number): T {
  return { ...box, sx: box.sx * scale, sy: box.sy * scale, width: box.width * scale, height: box.height * scale };
}
