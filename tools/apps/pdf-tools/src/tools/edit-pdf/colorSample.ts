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
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  try {
    const region = ctx.getImageData(left, top, Math.min(w, canvas.width - left), Math.min(h, canvas.height - top)).data;
    for (let i = 0; i < region.length; i += 4) {
      const r = region[i]!;
      const g = region[i + 1]!;
      const b = region[i + 2]!;

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
  let bgKey = "";
  let bg = { r: 255, g: 255, b: 255 };
  let bgCount = 0;
  for (const [key, bucket] of buckets) {
    if (bucket.count > bgCount) {
      bgCount = bucket.count;
      bgKey = key;
      bg = { r: Math.round(bucket.r / bucket.count), g: Math.round(bucket.g / bucket.count), b: Math.round(bucket.b / bucket.count) };
    }
  }

  // Ink used to be "whichever pixel is darkest" — wrong the moment the run
  // is light text on a dark or colored background (a heading banner, a dark
  // theme, reversed-out text in a callout box): the darkest pixel *is* the
  // background there, so textColor came back equal to backgroundColor and
  // the patched replacement text rendered invisible against its own cover.
  // Ink is reliably the bucket that differs most from the background in
  // color, regardless of which one is lighter — a real glyph fill is a
  // solid, repeated color (anti-aliasing aside), not a handful of stray
  // pixels, so requiring a minimum *count* excludes single-pixel noise along
  // a glyph edge without assuming a light-on-dark vs. dark-on-light
  // direction either way. This has to be an absolute pixel count, not a
  // share of the sample: normal-weight text at a typical size has a thin
  // stroke relative to its own bounding box (padded further by MARGIN and
  // the inter-glyph/line whitespace the majority vote above relies on), so
  // even a long, entirely solid-ink run can leave its true ink bucket well
  // under 1% of the total sampled pixels — a share-based floor high enough
  // to reject stray anti-aliasing rejected genuine ink right along with it,
  // letting an antialiased edge-blend bucket (partway between ink and
  // background, and therefore *closer* to the true colors than the correct
  // one this was trying to avoid) win by default instead.
  const MIN_INK_PIXELS = 4;
  let ink = { r: 0, g: 0, b: 0 };
  let inkDist = -1;
  for (const [key, bucket] of buckets) {
    if (key === bgKey || bucket.count < MIN_INK_PIXELS) continue;
    const r = bucket.r / bucket.count;
    const g = bucket.g / bucket.count;
    const b = bucket.b / bucket.count;
    const dist = (r - bg.r) ** 2 + (g - bg.g) ** 2 + (b - bg.b) ** 2;
    if (dist > inkDist) {
      inkDist = dist;
      ink = { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
    }
  }

  return {
    // No bucket cleared the noise floor — a blank click with nothing but
    // anti-aliasing in the sample — fall back to black rather than trust it.
    textColor: inkDist >= 0 ? rgbToHex(ink.r, ink.g, ink.b) : "#000000",
    backgroundColor: rgbToHex(bg.r, bg.g, bg.b),
  };
}
