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
