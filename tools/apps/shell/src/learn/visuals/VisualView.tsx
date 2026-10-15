import { Rich } from "../Rich.js";
import { CompareDiagram, LanesDiagram, LayersDiagram } from "./Blocks.js";
import { FlowDiagram, SequenceDiagram } from "./Diagrams.js";
import { BarsDiagram, MatMulDiagram, PlotDiagram } from "./MathViews.js";
import { CellsDiagram, TraceDiagram } from "./PythonViews.js";
import { QueueSim } from "./QueueSim.js";
import type { Visual } from "./types.js";
import { useStepper, type Stepper } from "./useStepper.js";

const KIND_LABEL: Record<Visual["type"], string> = {
  sequence: "Message flow",
  flow: "How it moves",
  lanes: "Over time",
  compare: "Side by side",
  layers: "The layers",
  queue: "Try it live",
  trace: "Step through the code",
  cells: "Memory view",
  plot: "Interactive graph",
  bars: "Try it live",
  matmul: "Multiply step by step",
};

type Stepped = Exclude<Visual, { type: "queue" }>;

/** Number of steps; 0 means "no guided steps" (a live-only diagram: sliders, no player). */
function stepCount(v: Stepped) {
  switch (v.type) {
    case "sequence": return v.steps.length;
    case "flow": return v.path.length;
    case "lanes": return v.length;
    case "compare": return v.rows.length;
    case "layers": return v.layers.length;
    case "trace": return v.steps.length;
    case "cells": return v.steps.length;
    case "plot": return v.steps?.length ?? 0;
    case "bars": return v.steps?.length ?? 0;
    case "matmul": return v.a.length * (v.b[0]?.length ?? 0);
  }
}

function caption(v: Stepped, step: number): string {
  switch (v.type) {
    case "sequence": { const m = v.steps[step]; return m ? (m.note ?? m.label) : ""; }
    case "flow": { const i = v.path[step]; return v.notes?.[step] ?? (i === undefined ? "" : (v.edges[i]?.label ?? "")); }
    case "lanes": return [...(v.notes ?? [])].reverse().find((n) => n.at <= step)?.text ?? "";
    case "compare": return v.rows[step] ? `${v.rows[step]?.label}` : "";
    case "layers": return v.layers[step]?.detail ?? "";
    case "trace": return v.steps[step]?.note ?? "";
    case "cells": return v.steps[step]?.note ?? "";
    case "plot": return v.steps?.[step]?.note ?? "";
    case "bars": return v.steps?.[step]?.note ?? "";
    case "matmul": return "";
  }
}

function Controls({ s }: { s: Stepper }) {
  return (
    <div className="lp-vctl">
      <button type="button" className="lp-btn" onClick={s.prev} disabled={s.step === 0} aria-label="Previous step">←</button>
      <button type="button" className="lp-btn lp-btn--primary" onClick={s.playing ? s.pause : s.play}>
        {s.playing ? "Pause" : s.atEnd ? "↻ Replay" : "▶ Play"}
      </button>
      <button type="button" className="lp-btn" onClick={s.next} disabled={s.atEnd} aria-label="Next step">→</button>
      <span className="lp-vctl__n" aria-hidden="true">{s.step + 1} / {s.count}</span>
      <span className="lp-bar lp-vctl__bar" aria-hidden="true"><i style={{ width: `${((s.step + 1) / s.count) * 100}%` }} /></span>
    </div>
  );
}

function SteppedView({ v }: { v: Stepped }) {
  const count = stepCount(v);
  const interval = v.type === "lanes" ? 750 : v.type === "compare" || v.type === "layers" ? 1200 : v.type === "trace" || v.type === "cells" ? 1900 : v.type === "plot" || v.type === "bars" ? 2200 : v.type === "matmul" ? 1400 : 1700;
  const s = useStepper(Math.max(1, count), interval);
  return (
    <>
      {v.type === "sequence" && <SequenceDiagram v={v} s={s} />}
      {v.type === "flow" && <FlowDiagram v={v} s={s} />}
      {v.type === "lanes" && <LanesDiagram v={v} s={s} />}
      {v.type === "compare" && <CompareDiagram v={v} s={s} />}
      {v.type === "layers" && <LayersDiagram v={v} s={s} />}
      {v.type === "trace" && <TraceDiagram v={v} s={s} />}
      {v.type === "cells" && <CellsDiagram v={v} s={s} />}
      {v.type === "plot" && <PlotDiagram v={v} s={s} />}
      {v.type === "bars" && <BarsDiagram v={v} s={s} />}
      {v.type === "matmul" && <MatMulDiagram v={v} s={s} />}
      {count > 0 && <Controls s={s} />}
      {count > 0 && <p className="lp-vcap" aria-live="polite"><Rich text={caption(v, s.step)} /></p>}
    </>
  );
}

/** Animated, step-through picture for a concept. */
export function VisualView({ visual }: { visual: Visual }) {
  const live = (visual.type === "plot" || visual.type === "bars") && !visual.steps?.length;
  return (
    <figure className="lp-visual">
      <figcaption><span className="lp-visual__kind">▶ {KIND_LABEL[visual.type]}</span><span>{live ? "Drag the sliders" : "Visual explanation"}</span></figcaption>
      {visual.type === "queue" ? <QueueSim v={visual} /> : <SteppedView v={visual} />}
      <p className="lp-visual__take"><b>Remember:</b> <Rich text={visual.takeaway} /></p>
    </figure>
  );
}
