/**
 * Find & Replace support — searches the text pdf.js already extracted while
 * rendering each page (see EditPdf.tsx's renderPagesToImages).
 *
 * Matching is per text-run (pdf.js's own grouping of glyphs into styled
 * spans), not across runs. That means a search phrase split across two runs
 * by the source PDF's own layout (a common case: hyphenation, mixed
 * formatting mid-word) won't be found. Reconstructing paragraphs across runs
 * reliably would need the same kind of geometry heuristic pdfToText already
 * uses and carries the same caveat that tool documents — good on single-run
 * prose, not guaranteed on split runs. Documented rather than silently wrong.
 */

export interface TextRun {
  page: number;
  str: string;
  /** PDF-space box, bottom-left origin — matches every other annotation's coordinate convention. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** The run's real font name plus pdf.js's generic family guess, space-joined (e.g. "Helvetica-Bold sans-serif") — see `resolveRunFont` in EditPdf.tsx and fontMatch.ts. */
  fontFamilyHint: string;
  /** pdf.js's own resolved weight/slant for this run, when the page rendered far enough to expose it — authoritative, and unlike `fontFamilyHint` not a keyword guess. Undefined means "unknown, fall back to matching on the hint string". */
  bold?: boolean;
  italic?: boolean;
  /** True when the run's transform isn't simple axis-aligned horizontal text — see design doc §3 point 5 (click-to-edit skips these, same as a rotated/vertical run always has). */
  rotated: boolean;
}

export interface TextMatch {
  page: number;
  runIndex: number;
  /** Character offset of the match within the run's string — used to replace only the matched slice, if ever needed. */
  start: number;
  end: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Finds the text run a click landed on, for "click existing text to edit"
 * (design doc §3 point 2). Skips rotated/vertical runs — those fall back to
 * the ordinary "place new text" behavior rather than a best-effort patch,
 * since there's no honest way to make a horizontal overlay look right on
 * top of them.
 *
 * Hit-tests with a small tolerance around each run's own tight glyph box,
 * not an exact bounding-box check — pdf.js splits text into a separate run
 * per style change (bold vs. regular, a color change mid-line, etc.), so
 * there are often small real gaps *between* runs on the same line, and a
 * run's vertical box is tight around glyph ink, tighter than the visually
 * "clickable" line a user aims for. Without tolerance, an ordinary click
 * regularly lands in one of those gaps, missing every run and falling
 * through to "place new blank text" instead of patching the text that was
 * actually clicked — reported twice as stray "(empty)" boxes littering the
 * page. Where a click's tolerance zone overlaps more than one run, the run
 * it's *closest* to (or squarely inside, distance 0) wins.
 */
export function findRunAt(runs: TextRun[], page: number, x: number, y: number): TextRun | null {
  const H_PAD = 2;
  let best: TextRun | null = null;
  let bestDist = Infinity;
  for (const run of runs) {
    if (run.page !== page || run.rotated) continue;
    const vPad = Math.max(2, run.height * 0.3);
    if (x < run.x - H_PAD || x > run.x + run.width + H_PAD || y < run.y - vPad || y > run.y + run.height + vPad) continue;
    const dx = Math.max(run.x - x, 0, x - (run.x + run.width));
    const dy = Math.max(run.y - y, 0, y - (run.y + run.height));
    const dist = dx + dy;
    if (dist < bestDist) {
      bestDist = dist;
      best = run;
    }
  }
  return best;
}

export function findMatches(runs: TextRun[], query: string): TextMatch[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const matches: TextMatch[] = [];
  runs.forEach((run, runIndex) => {
    const haystack = run.str.toLowerCase();
    let from = 0;
    for (;;) {
      const at = haystack.indexOf(q, from);
      if (at < 0) break;
      // Approximate the matched slice's box as a fraction of the run's box —
      // good enough for a highlight ring or a whiteout patch; the run itself
      // rarely mixes wildly different glyph widths within one styled span.
      const charWidth = run.width / Math.max(1, run.str.length);
      matches.push({
        page: run.page,
        runIndex,
        start: at,
        end: at + q.length,
        x: run.x + at * charWidth,
        y: run.y,
        width: q.length * charWidth,
        height: run.height,
      });
      from = at + q.length;
    }
  });

  return matches;
}
