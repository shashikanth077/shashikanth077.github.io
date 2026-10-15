/**
 * Compact authoring helpers — a visual should take a few lines, not a page.
 * Tones: g good, b bad, w warn, i info, p plain (default).
 */
import type { CompareVisual, FlowVisual, LanesVisual, LayersVisual, QueueVisual, SequenceVisual, Tone } from "./types.js";

const T: Record<string, Tone> = { g: "good", b: "bad", w: "warn", i: "info", p: "plain" };
const tone = (c?: string): Tone | undefined => (c ? T[c] : undefined);

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
