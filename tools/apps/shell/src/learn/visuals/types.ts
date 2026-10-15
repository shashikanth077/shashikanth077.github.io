/**
 * Visual explanation specs. Each concept can have one; the renderer in
 * VisualView.tsx animates it step by step. Author with the helpers in kit.ts.
 *
 * Text fields support the same {{code}} markup as the handbook content.
 */

interface Base {
  /** One sentence shown under the diagram: the idea to remember. */
  takeaway: string;
}

/** Messages between actors over time (request flows, protocols, handshakes). */
export interface SequenceVisual extends Base {
  type: "sequence";
  actors: string[];
  steps: {
    from: number;
    to: number;
    label: string;
    /** Longer explanation shown in the caption while this step is active. */
    note?: string;
    /** Draw as a dashed reply. */
    reply?: boolean;
    /** Colour the message as a problem. */
    bad?: boolean;
  }[];
}

/** Boxes and arrows with a token travelling a path. Use layout "cycle" for loops and state machines. */
export interface FlowVisual extends Base {
  type: "flow";
  layout: "row" | "cycle";
  nodes: { label: string; sub?: string; tone?: Tone }[];
  edges: { from: number; to: number; label?: string }[];
  /** Edge indices the token travels, in order. */
  path: number[];
  /** Caption per path step; falls back to the edge label. */
  notes?: string[];
}

/** Things happening in parallel over time (concurrency, retries, TTLs, timelines). */
export interface LanesVisual extends Base {
  type: "lanes";
  /** Number of time ticks. */
  length: number;
  lanes: { name: string; blocks: { start: number; len: number; label: string; tone?: Tone }[] }[];
  /** Caption shown from tick `at` onwards. */
  notes?: { at: number; text: string }[];
}

/** Side-by-side comparison revealed row by row. */
export interface CompareVisual extends Base {
  type: "compare";
  heads: string[];
  rows: { label: string; cells: string[] }[];
  /** Index of the head to highlight as the usual winner, if any. */
  pick?: number;
}

/** Stacked layers highlighted in turn (architecture, request pipelines, memory tiers). */
export interface LayersVisual extends Base {
  type: "layers";
  layers: { label: string; detail: string; tone?: Tone }[];
  /** Label for the arrow along the stack, e.g. "request" */
  direction?: string;
}

/** Live mini-simulation of producers, a bounded queue and workers, with sliders. */
export interface QueueVisual extends Base {
  type: "queue";
  producer: string;
  queue: string;
  worker: string;
  /** Items per second arriving / each worker finishes. */
  arrival: number;
  service: number;
  workers: number;
  capacity: number;
  /** What happens when the queue is full. */
  overflow: "drop" | "block";
}

/** Python-tutor style execution trace: code lines, variables and printed output. */
export interface TraceVisual extends Base {
  type: "trace";
  code: string[];
  steps: {
    /** 1-based line being executed. */
    line: number;
    /** Variables created or changed by this line (merged into the running state). */
    set?: Record<string, string>;
    /** Text printed by this line. */
    out?: string;
    note?: string;
  }[];
}

export interface CellsRow {
  name: string;
  kind: "list" | "tuple" | "dict" | "string" | "plain";
  /** Dict cells are "key|value". */
  cells: string[];
  /** Show positions under each cell. */
  index: "pos" | "posneg" | "none";
}

/** Boxes in a row (list, tuple, dict, string) with indexes; steps highlight ranges or replace rows. */
export interface CellsVisual extends Base {
  type: "cells";
  rows: CellsRow[];
  steps: {
    note: string;
    /** [rowIndex, fromCell, toCell] inclusive ranges to highlight. */
    hl?: [number, number, number][];
    /** Replacement rows from this step on (e.g. after append). */
    rows?: CellsRow[];
  }[];
}

/** Colour names for plot layers. */
export type Hue = "accent" | "good" | "bad" | "warn" | "info" | "purple" | "muted";

export interface PlotParam {
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
}

interface LayerBase {
  color?: Hue;
  dash?: boolean;
  /** Text next to the element. {expr} placeholders are filled in live. */
  label?: string;
  /** Visible only while this expression is positive. */
  show?: string;
}

/** Every number is a formula over x, the params and the defs (see expr.ts). */
export type PlotLayer =
  | (LayerBase & { kind: "curve"; y: string; from?: string; to?: string })
  | (LayerBase & { kind: "point"; x: string; y: string })
  | (LayerBase & { kind: "line"; x: string; y: string; slope: string })
  | (LayerBase & { kind: "segment"; x1: string; y1: string; x2: string; y2: string })
  | (LayerBase & { kind: "arrow"; x1: string; y1: string; x2: string; y2: string })
  | (LayerBase & { kind: "vline"; x: string })
  | (LayerBase & { kind: "hline"; y: string })
  | (LayerBase & { kind: "fill"; y: string; from: string; to: string; base?: string })
  | (LayerBase & { kind: "circle"; x: string; y: string; r: string })
  | (LayerBase & { kind: "polygon"; pts: [string, string][]; fill?: boolean })
  | (LayerBase & { kind: "text"; x: string; y: string });

interface Live {
  /** Sliders the learner can drag. */
  params?: PlotParam[];
  /** Intermediate named formulas, evaluated in order. */
  defs?: [string, string][];
  /** Lines of text with {expr} / {expr:3} placeholders. */
  readout?: string[];
  /** Optional guided steps that move the params (animated), with a caption each. */
  steps?: { note: string; set?: Record<string, number> }[];
}

/** An interactive graph: sliders, formulas, and optional guided steps. */
export interface PlotVisual extends Base, Live {
  type: "plot";
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
  xlabel?: string;
  ylabel?: string;
  layers: PlotLayer[];
}

/** Live bar chart (probabilities, scores, counts). */
export interface BarsVisual extends Base, Live {
  type: "bars";
  bars: { label: string; value: string }[];
  /** Full-bar value (default 1). */
  max?: number;
  /** Show values as percentages. */
  percent?: boolean;
}

/** Matrix multiplication one output cell at a time. */
export interface MatMulVisual extends Base {
  type: "matmul";
  a: number[][];
  b: number[][];
  names?: [string, string, string];
  /** Optional bias added to every row of the result. */
  bias?: number[];
}

export type Tone = "good" | "bad" | "warn" | "info" | "plain";

export type Visual = SequenceVisual | FlowVisual | LanesVisual | CompareVisual | LayersVisual | QueueVisual | TraceVisual | CellsVisual | PlotVisual | BarsVisual | MatMulVisual;

/** concept id (e.g. "async:2") or question id → visual */
export type VisualMap = Record<string, Visual>;
