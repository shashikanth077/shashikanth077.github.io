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
