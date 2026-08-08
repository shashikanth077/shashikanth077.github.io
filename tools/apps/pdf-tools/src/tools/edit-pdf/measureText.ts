/**
 * Real text measurement for the editor's text-annotation selection/hover
 * outline and its floating toolbar's position.
 *
 * Both used to be a fixed per-character heuristic (`text.length * fontSize *
 * 0.55 + padding`), which never matches the actual rendered glyphs — narrow
 * text got an outline visibly larger than the text itself. Sejda's own text
 * box is a plain `contenteditable` div with zero padding, so its outline is
 * exactly the browser's own text layout. We can't use a live DOM box the
 * same way from `getAnnotationScreenBox` (it has no element to measure —
 * it's called before anything renders, to position the floating toolbar),
 * so instead we measure with an offscreen canvas using the identical font
 * string the `<text>` element renders with. That keeps the outline and the
 * toolbar position derived from the same real measurement, not a guess.
 */

let scratchCtx: CanvasRenderingContext2D | null = null;

function getScratchCtx(): CanvasRenderingContext2D {
  if (!scratchCtx) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas context unavailable");
    scratchCtx = ctx;
  }
  return scratchCtx;
}

export interface MeasuredText {
  width: number;
}

/**
 * Measures `text` as it will actually render at `fontSizePx` (already in
 * screen/render-scale pixels, not PDF points) with the given family/weight/
 * style. Falls back to a rough estimate if canvas measurement throws (e.g.
 * no DOM available) so callers never have to special-case SSR/tests.
 */
export function measureText(text: string, fontSizePx: number, fontFamily: string, bold: boolean, italic: boolean): MeasuredText {
  const content = text || "(empty)";
  try {
    const ctx = getScratchCtx();
    ctx.font = `${italic ? "italic " : ""}${bold ? "700 " : ""}${fontSizePx}px ${fontFamily}`;
    const width = ctx.measureText(content).width;
    return { width: Math.max(width, fontSizePx * 0.3) };
  } catch {
    return { width: Math.max(content.length * fontSizePx * 0.55, fontSizePx * 0.3) };
  }
}
