import { P } from "../../visuals/kit.js";
import type { CellsRow } from "../../visuals/types.js";

/** A table as boxes: a header row, then one row per record (row 0 of the diagram is the header). */
export const table = (headers: string[], rows: string[][], names?: string[]): CellsRow[] => [
  P("columns", headers),
  ...rows.map((r, i) => P(names?.[i] ?? String(i + 1), r)),
];

/** Equal-aspect plot ranges: the plot area is about 642 × 334 pixels, so x range = 1.922 × y range keeps circles round. */
export const ASPECT = 642 / 334;
export const eqX = (y0: number, y1: number, xCentre: number): [number, number] => {
  const half = ((y1 - y0) * ASPECT) / 2;
  return [xCentre - half, xCentre + half];
};

/** The eight teaching emails used for trees, Naive Bayes and thresholds: [id, links, offer, label]. */
export const emails: [string, number, number, "Normal" | "Spam"][] = [
  ["E1", 0, 0, "Normal"], ["E2", 1, 0, "Normal"], ["E3", 1, 1, "Normal"], ["E4", 2, 0, "Normal"],
  ["E5", 3, 1, "Spam"], ["E6", 4, 1, "Spam"], ["E7", 4, 0, "Spam"], ["E8", 5, 1, "Spam"],
];
export const emailRows = emails.map(([id, l, o, y]) => [id, String(l), String(o), y]);
export const emailHead = ["email", "links", "offer", "label"];

/** The delivery map used for clustering: A–H in km. */
export const delivery: [string, number, number][] = [
  ["A", 1, 1], ["B", 1, 2], ["C", 2, 1], ["D", 8, 8], ["E", 8, 9], ["F", 9, 8], ["G", 5, 1], ["H", 2.8, 1],
];
