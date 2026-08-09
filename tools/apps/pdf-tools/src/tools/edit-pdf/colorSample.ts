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

  // A couple of screen pixels of margin around the tight glyph box — pulls
  // in more genuine background fill relative to ink for the majority vote
  // below, without straying far enough to cross into a different section.
  const MARGIN = 2;
  const topLeft = pdfToScreen(page, run.x, run.y + run.height);
  const w = Math.max(1, Math.round(run.width * RENDER_SCALE)) + MARGIN * 2;
  const h = Math.max(1, Math.round(run.height * RENDER_SCALE)) + MARGIN * 2;
  const left = Math.max(0, Math.min(canvas.width - 1, Math.round(topLeft.sx) - MARGIN));
  const top = Math.max(0, Math.min(canvas.height - 1, Math.round(topLeft.sy) - MARGIN));

  // Quantized-color histogram bucket size — merges near-identical shades
  // that anti-aliasing spreads a solid fill or a glyph edge across, so a
  // handful of very-slightly-different pinks don't each look like a
  // one-off color and lose to some other, unrelated bucket.
  const QUANT = 16;
  let darkest = { r: 255, g: 255, b: 255, sum: 765 };
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  try {
    const region = ctx.getImageData(left, top, Math.min(w, canvas.width - left), Math.min(h, canvas.height - top)).data;
    for (let i = 0; i < region.length; i += 4) {
      const r = region[i]!;
      const g = region[i + 1]!;
      const b = region[i + 2]!;
      const sum = r + g + b;
      if (sum < darkest.sum) darkest = { r, g, b, sum };

      const key = `${Math.round(r / QUANT)},${Math.round(g / QUANT)},${Math.round(b / QUANT)}`;
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.r += r;
        bucket.g += g;
        bucket.b += b;
        bucket.count++;
      } else {
        buckets.set(key, { r, g, b, count: 1 });
      }
    }
  } catch {
    return fallback;
  }

  // The background fill — whatever's *behind* the text, colored section or
  // plain white page alike — is the majority of pixels inside a text run's
  // own box: normal text has far more inter-glyph/inter-line whitespace
  // than ink. Taking the largest color bucket from the exact same region
  // the run lives in (rather than guessing a separate point outside it, the
  // old approach) can't overshoot into a neighboring white margin or a
  // different section the way a single fixed-offset pixel could — that was
  // reported as a colored section's background "vanishing" to white after
  // an edit. Ties are broken by whichever bucket the loop met first
  // (top-left to bottom-right), an arbitrary but stable choice.
  let bg = { r: 255, g: 255, b: 255 };
  let bgCount = 0;
  for (const bucket of buckets.values()) {
    if (bucket.count > bgCount) {
      bgCount = bucket.count;
      bg = { r: Math.round(bucket.r / bucket.count), g: Math.round(bucket.g / bucket.count), b: Math.round(bucket.b / bucket.count) };
    }
  }

  return {
    // A very light "darkest pixel" (sum close to 765 = pure white) means the
    // box was blank/anti-aliased-only — fall back to black rather than trust noise.
    textColor: darkest.sum < 650 ? rgbToHex(darkest.r, darkest.g, darkest.b) : "#000000",
    backgroundColor: rgbToHex(bg.r, bg.g, bg.b),
  };
}
