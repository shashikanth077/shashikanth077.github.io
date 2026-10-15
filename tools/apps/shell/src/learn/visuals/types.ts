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

export type Tone = "good" | "bad" | "warn" | "info" | "plain";

export type Visual = SequenceVisual | FlowVisual | LanesVisual | CompareVisual | LayersVisual | QueueVisual;

/** concept id (e.g. "async:2") or question id → visual */
export type VisualMap = Record<string, Visual>;
