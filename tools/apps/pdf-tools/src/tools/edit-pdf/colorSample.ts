/**
 * Reads ink and background color for a text run straight off the page's
 * already-rendered `<img>` — no extra decode needed, since by the time a
 * user can click on that image it's already fully loaded and on screen.
 * Used by the existing-text patch pipeline (design doc §3 point 3) so the
 * cover rectangle matches a tinted or scanned background instead of
 * assuming white, and the replacement text roughly matches the original
 * ink color instead of assuming black.
 */

import { pdfToScreen, RENDER_SCALE, type RenderedPage } from "./geometry.js";
import type { TextRun } from "./textSearch.js";

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("")}`;
}

export function sampleRunColors(
  imgEl: HTMLImageElement,
  page: RenderedPage,
  run: TextRun,
): { textColor: string; backgroundColor: string } {
  const fallback = { textColor: "#000000", backgroundColor: "#FFFFFF" };
  if (!imgEl.complete || imgEl.naturalWidth === 0) return fallback;

  const canvas = document.createElement("canvas");
  canvas.width = page.screenWidth;
  canvas.height = page.screenHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return fallback;

  try {
    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
  } catch {
    return fallback; // Shouldn't happen for a same-origin data: URL, but never let a paint failure break editing.
  }

  const topLeft = pdfToScreen(page, run.x, run.y + run.height);
  const w = Math.max(1, Math.round(run.width * RENDER_SCALE));
  const h = Math.max(1, Math.round(run.height * RENDER_SCALE));
  const left = Math.max(0, Math.min(canvas.width - 1, Math.round(topLeft.sx)));
  const top = Math.max(0, Math.min(canvas.height - 1, Math.round(topLeft.sy)));

  let darkest = { r: 255, g: 255, b: 255, sum: 765 };
  try {
    const region = ctx.getImageData(left, top, Math.min(w, canvas.width - left), Math.min(h, canvas.height - top)).data;
    for (let i = 0; i < region.length; i += 4) {
      const r = region[i]!;
      const g = region[i + 1]!;
      const b = region[i + 2]!;
      const sum = r + g + b;
      if (sum < darkest.sum) darkest = { r, g, b, sum };
    }
  } catch {
    return fallback;
  }

  // Sample just outside the box's top-left corner for the page background —
  // a couple of pixels clear of the glyphs themselves.
  let bg = { r: 255, g: 255, b: 255 };
  try {
    const bgX = Math.max(0, Math.min(canvas.width - 1, left - 3));
    const bgY = Math.max(0, Math.min(canvas.height - 1, top - 3));
    const px = ctx.getImageData(bgX, bgY, 1, 1).data;
    bg = { r: px[0]!, g: px[1]!, b: px[2]! };
  } catch {
    // Keep the white default.
  }

  return {
    // A very light "darkest pixel" (sum close to 765 = pure white) means the
    // box was blank/anti-aliased-only — fall back to black rather than trust noise.
    textColor: darkest.sum < 650 ? rgbToHex(darkest.r, darkest.g, darkest.b) : "#000000",
    backgroundColor: rgbToHex(bg.r, bg.g, bg.b),
  };
}
