/**
 * Compact authoring helpers — a visual should take a few lines, not a page.
 * Tones: g good, b bad, w warn, i info, p plain (default).
 */
import type { CellsRow, CellsVisual, CompareVisual, FlowVisual, LanesVisual, LayersVisual, QueueVisual, SequenceVisual, Tone, TraceVisual } from "./types.js";

const TONES: Record<string, Tone> = { g: "good", b: "bad", w: "warn", i: "info", p: "plain" };
const tone = (c?: string): Tone | undefined => (c ? TONES[c] : undefined);

/** seq(takeaway, actors, [from, to, label, note?, flags?]) — flags: "r" reply, "b" bad. */
export function seq(takeaway: string, actors: string[], steps: [number, number, string, string?, string?][]): SequenceVisual {
  return {
    type: "sequence",
    takeaway,
    actors,
    steps: steps.map(([from, to, label, note, flags]) => ({
      from,
      to,
      label,
      ...(note ? { note } : {}),
      ...(flags?.includes("r") ? { reply: true } : {}),
      ...(flags?.includes("b") ? { bad: true } : {}),
    })),
  };
}

/** Node as "Label|sub|g". */
function node(s: string) {
  const [label = "", sub, t] = s.split("|");
  return { label, ...(sub ? { sub } : {}), ...(tone(t) ? { tone: tone(t) as Tone } : {}) };
}

/**
 * flow(takeaway, "row"|"cycle", ["A|sub|g", "B"], [[0,1,"label"], …], path?, notes?)
 * path defaults to every edge in order.
 */
export function flow(
  takeaway: string,
  layout: "row" | "cycle",
  nodes: string[],
  edges: [number, number, string?][],
  path?: number[],
  notes?: string[],
): FlowVisual {
  return {
    type: "flow",
    takeaway,
    layout,
    nodes: nodes.map(node),
    edges: edges.map(([from, to, label]) => ({ from, to, ...(label ? { label } : {}) })),
    path: path ?? edges.map((_, i) => i),
    ...(notes ? { notes } : {}),
  };
}

/** lanes(takeaway, length, { "Lane": [[start, len, "label", "g"], …] }, [[at, "note"], …]) */
export function lanes(takeaway: string, length: number, l: Record<string, [number, number, string, string?][]>, notes?: [number, string][]): LanesVisual {
  return {
    type: "lanes",
    takeaway,
    length,
    lanes: Object.entries(l).map(([name, blocks]) => ({
      name,
      blocks: blocks.map(([start, len, label, c]) => ({ start, len, label, ...(tone(c) ? { tone: tone(c) as Tone } : {}) })),
    })),
    ...(notes ? { notes: notes.map(([at, text]) => ({ at, text })) } : {}),
  };
}

/** compare(takeaway, ["A","B"], [["Criterion","a","b"], …], pickIndex?) */
export function compare(takeaway: string, heads: string[], rows: string[][], pick?: number): CompareVisual {
  return {
    type: "compare",
    takeaway,
    heads,
    rows: rows.map(([label = "", ...cells]) => ({ label, cells })),
    ...(pick !== undefined ? { pick } : {}),
  };
}

/** layers(takeaway, ["Label|detail|g", …], "direction"?) — top layer first. */
export function layers(takeaway: string, items: string[], direction?: string): LayersVisual {
  return {
    type: "layers",
    takeaway,
    layers: items.map((s) => {
      const [label = "", detail = "", t] = s.split("|");
      return { label, detail, ...(tone(t) ? { tone: tone(t) as Tone } : {}) };
    }),
    ...(direction ? { direction } : {}),
  };
}

/** queue(takeaway, { producer, queue, worker, arrival, service, workers, capacity, overflow }) */
export function queue(takeaway: string, o: Omit<QueueVisual, "type" | "takeaway">): QueueVisual {
  return { type: "queue", takeaway, ...o };
}

/**
 * trace(takeaway, code, [[line, { var: "value" }, "printed text", "note"], …])
 * `code` is the multi-line source; lines are numbered from 1.
 */
export function trace(takeaway: string, code: string, steps: [number, Record<string, string>?, string?, string?][]): TraceVisual {
  return {
    type: "trace",
    takeaway,
    code: code.replace(/^\n/, "").replace(/\n$/, "").split("\n"),
    steps: steps.map(([line, set, out, note]) => ({ line, ...(set ? { set } : {}), ...(out ? { out } : {}), ...(note ? { note } : {}) })),
  };
}

const row = (kind: CellsRow["kind"], name: string, cells: string[], index: CellsRow["index"]): CellsRow => ({ name, kind, cells, index });
/** Row builders for cells(): list, tuple, dict ("key|value"), string, plain values. */
export const L = (name: string, cells: string[], index: CellsRow["index"] = "posneg") => row("list", name, cells, index);
export const T = (name: string, cells: string[], index: CellsRow["index"] = "posneg") => row("tuple", name, cells, index);
export const D = (name: string, cells: string[]) => row("dict", name, cells, "none");
export const S = (name: string, text: string, index: CellsRow["index"] = "posneg") => row("string", name, [...text], index);
export const P = (name: string, cells: string[]) => row("plain", name, cells, "none");

/** cells(takeaway, rows, [[note, [[row, from, to]], replacementRows?], …]) */
export function cells(takeaway: string, rows: CellsRow[], steps: [string, [number, number, number][]?, CellsRow[]?][]): CellsVisual {
  return {
    type: "cells",
    takeaway,
    rows,
    steps: steps.map(([note, hl, r]) => ({ note, ...(hl ? { hl } : {}), ...(r ? { rows: r } : {}) })),
  };
}
