/**
 * Line- and word-level text diff, backed by jsdiff.
 *
 * jsdiff implements the Myers diff algorithm and handles the awkward cases
 * (trailing newlines, mixed line endings, empty inputs) correctly — writing
 * a hand-rolled line differ that gets those right is more work than it seems.
 */

import { diffLines, diffWordsWithSpace, type Change } from "diff";

export type DiffLineKind = "added" | "removed" | "unchanged";

export interface DiffLine {
  kind: DiffLineKind;
  text: string;
  /** 1-based line number on the left/right side, or null when this line
   *  doesn't exist on that side (added → no left, removed → no right). */
  leftNumber: number | null;
  rightNumber: number | null;
}

export interface DiffSummary {
  added: number;
  removed: number;
  unchanged: number;
}

export interface LineDiffResult {
  lines: DiffLine[];
  summary: DiffSummary;
}

/**
 * Compute a line-by-line diff. Line numbers on each side start at 1 and skip
 * indices that don't exist on that side, exactly like `git diff` shows them.
 */
export function computeLineDiff(left: string, right: string): LineDiffResult {
  const changes: Change[] = diffLines(left, right);
  const out: DiffLine[] = [];
  let leftCounter = 0;
  let rightCounter = 0;
  const summary: DiffSummary = { added: 0, removed: 0, unchanged: 0 };

  for (const change of changes) {
    // jsdiff includes a trailing newline in each chunk. Splitting on \n and
    // dropping the last empty element preserves original line boundaries.
    const rawLines = change.value.split("\n");
    if (rawLines[rawLines.length - 1] === "") rawLines.pop();

    for (const line of rawLines) {
      if (change.added) {
        rightCounter++;
        summary.added++;
        out.push({ kind: "added", text: line, leftNumber: null, rightNumber: rightCounter });
      } else if (change.removed) {
        leftCounter++;
        summary.removed++;
        out.push({ kind: "removed", text: line, leftNumber: leftCounter, rightNumber: null });
      } else {
        leftCounter++;
        rightCounter++;
        summary.unchanged++;
        out.push({
          kind: "unchanged",
          text: line,
          leftNumber: leftCounter,
          rightNumber: rightCounter,
        });
      }
    }
  }

  return { lines: out, summary };
}

/**
 * A pair of aligned rows for side-by-side rendering. Unchanged rows appear
 * once (mirrored); a removed line pairs with an added line when both are
 * adjacent, otherwise stands alone with an empty half.
 */
export interface SideBySideRow {
  left: DiffLine | null;
  right: DiffLine | null;
}

export function toSideBySide(lines: DiffLine[]): SideBySideRow[] {
  const rows: SideBySideRow[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.kind === "unchanged") {
      rows.push({ left: line, right: line });
      i++;
      continue;
    }
    // Greedily pair a run of removed lines with a run of added lines that
    // follows it, one-for-one, so edits show as red-on-left / green-on-right
    // in the same row instead of two separate blocks.
    const removed: DiffLine[] = [];
    while (i < lines.length && lines[i]!.kind === "removed") {
      removed.push(lines[i]!);
      i++;
    }
    const added: DiffLine[] = [];
    while (i < lines.length && lines[i]!.kind === "added") {
      added.push(lines[i]!);
      i++;
    }
    const pairCount = Math.max(removed.length, added.length);
    for (let k = 0; k < pairCount; k++) {
      rows.push({ left: removed[k] ?? null, right: added[k] ?? null });
    }
  }
  return rows;
}

export interface WordChange {
  kind: DiffLineKind;
  text: string;
}

/** Word-level diff for a single pair of lines — used to highlight the changed
 *  spans within an edit row on side-by-side view. */
export function computeWordDiff(left: string, right: string): WordChange[] {
  const changes = diffWordsWithSpace(left, right);
  return changes.map((c) => ({
    kind: c.added ? "added" : c.removed ? "removed" : "unchanged",
    text: c.value,
  }));
}
