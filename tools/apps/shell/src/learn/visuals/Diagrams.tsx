import { useId } from "react";
import { plain } from "../Rich.js";
import type { FlowVisual, SequenceVisual } from "./types.js";
import type { Stepper } from "./useStepper.js";

function wrap(text: string, max: number, maxLines = 2) {
  const lines: string[] = [];
  let cur = "";
  for (const word of plain(text).split(" ")) {
    if (cur && `${cur} ${word}`.length > max) {
      lines.push(cur);
      cur = word;
    } else cur = cur ? `${cur} ${word}` : word;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
}

/** Wrap a message label to fit the gap between two lifelines (never drops words). */
function labelLines(label: string, span: number) {
  const max = Math.max(10, Math.floor((span - 16) / 6.4));
  const words = plain(label).split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && `${cur} ${w}`.length > max) {
      lines.push(cur);
      cur = w;
    } else cur = cur ? `${cur} ${w}` : w;
  }
  if (cur) lines.push(cur);
  return lines;
}

const dur = (s: Stepper, seconds: number) => `${s.reduced ? 0.01 : seconds}s`;

/* ------------------------------------------------------------------ */

export function SequenceDiagram({ v, s }: { v: SequenceVisual; s: Stepper }) {
  const n = v.actors.length;
  const colW = Math.max(120, Math.min(190, 780 / n));
  const W = colW * n;
  const x = (i: number) => colW * i + colW / 2;
  const top = 74;
  const rowH = 46;
  const H = top + v.steps.length * rowH + 10;
  const cur = v.steps[s.step];

  return (
    <svg className="lp-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={v.takeaway}>
      {v.actors.map((a, i) => {
        const active = !!cur && (cur.from === i || cur.to === i);
        return (
          <g key={i}>
            <line x1={x(i)} x2={x(i)} y1={46} y2={H - 4} className="lp-seq__life" />
            <rect x={x(i) - colW / 2 + 8} y={6} width={colW - 16} height={36} rx={10} className={`lp-seq__actor${active ? " is-active" : ""}`} />
            <text x={x(i)} y={29} textAnchor="middle" className="lp-seq__name">{wrap(a, Math.floor(colW / 8), 1)[0]}</text>
          </g>
        );
      })}
      {v.steps.map((m, i) => {
        if (i > s.step) return null;
        const y = top + i * rowH + 18;
        const x1 = x(m.from);
        const x2 = x(m.to);
        const self = m.from === m.to;
        const dir = x2 >= x1 ? 1 : -1;
        const cls = `lp-seq__msg${i === s.step ? " is-now" : ""}${m.bad ? " is-bad" : ""}${m.reply ? " is-reply" : ""}`;
        return (
          <g key={i} className={cls}>
            {self ? (
              <>
                <path d={`M ${x1} ${y - 6} h 34 v 22 h -34`} fill="none" />
                <polygon points={`${x1},${y + 16} ${x1 + 8},${y + 12} ${x1 + 8},${y + 20}`} className="lp-seq__head" />
                <text x={x1 + 42} y={y + 8} className="lp-seq__label">{plain(m.label)}</text>
              </>
            ) : (
              <>
                <line x1={x1} y1={y} x2={x2 - dir * 8} y2={y} />
                <polygon points={`${x2},${y} ${x2 - dir * 10},${y - 5} ${x2 - dir * 10},${y + 5}`} className="lp-seq__head" />
                <text x={(x1 + x2) / 2} y={y - 8 - (labelLines(m.label, Math.abs(x2 - x1)).length - 1) * 13} textAnchor="middle" className="lp-seq__label">
                  {labelLines(m.label, Math.abs(x2 - x1)).map((l, k) => <tspan key={k} x={(x1 + x2) / 2} dy={k ? 13 : 0}>{l}</tspan>)}
                </text>
              </>
            )}
            {i === s.step && (
              <circle r={6} cy={self ? y + 5 : y} className="lp-token" key={`dot-${s.step}`}>
                <animate attributeName="cx" from={x1} to={self ? x1 + 34 : x2} dur={dur(s, 0.7)} fill="freeze" />
              </circle>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */

interface Pt { x: number; y: number }
const HW = 66;
const HH = 34;

function clip(c: Pt, toward: Pt): Pt {
  const dx = toward.x - c.x;
  const dy = toward.y - c.y;
  if (!dx && !dy) return c;
  const t = Math.min(HW / (Math.abs(dx) || Infinity), HH / (Math.abs(dy) || Infinity));
  return { x: c.x + dx * t, y: c.y + dy * t };
}

export function FlowDiagram({ v, s }: { v: FlowVisual; s: Stepper }) {
  const uid = useId().replace(/:/g, "");
  const n = v.nodes.length;
  const cycle = v.layout === "cycle" && n >= 3;

  let W: number;
  let H: number;
  const centers: Pt[] = [];
  if (cycle) {
    W = 700;
    H = 380;
    v.nodes.forEach((_, i) => {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
      centers.push({ x: W / 2 + 255 * Math.cos(a), y: H / 2 + 138 * Math.sin(a) });
    });
  } else {
    const cols = n <= 4 ? n : Math.ceil(n / 2);
    const rows = n <= 4 ? 1 : 2;
    const cellW = 190;
    const cellH = 130;
    W = Math.max(cols * cellW, 380);
    H = rows * cellH + 20;
    v.nodes.forEach((_, i) => {
      centers.push({ x: (i % cols) * cellW + cellW / 2 + (W - cols * cellW) / 2, y: Math.floor(i / cols) * cellH + 66 });
    });
  }

  const geo = v.edges.map((e) => {
    const a = centers[e.from];
    const b = centers[e.to];
    if (!a || !b) return null;
    const hasReverse = v.edges.some((o) => o.from === e.to && o.to === e.from);
    const consecutive = cycle ? (e.to - e.from + n) % n === 1 : Math.abs(e.to - e.from) === 1 && Math.abs(a.y - b.y) < 5;
    const curved = hasReverse || !consecutive;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const k = curved ? (hasReverse ? 0.22 : 0.3) * len : 0;
    const c: Pt = { x: (a.x + b.x) / 2 + (-dy / len) * k, y: (a.y + b.y) / 2 + (dx / len) * k };
    const p0 = clip(a, c);
    const p2 = clip(b, c);
    const mid: Pt = { x: 0.25 * p0.x + 0.5 * c.x + 0.25 * p2.x, y: 0.25 * p0.y + 0.5 * c.y + 0.25 * p2.y };
    return { d: `M ${p0.x} ${p0.y} Q ${c.x} ${c.y} ${p2.x} ${p2.y}`, mid };
  });

  const curEdgeIdx = v.path[s.step];
  const curEdge = curEdgeIdx === undefined ? undefined : v.edges[curEdgeIdx];
  const seenEdges = new Set(v.path.slice(0, s.step + 1));
  const seenNodes = new Set<number>();
  v.path.slice(0, s.step + 1).forEach((ei) => {
    const e = v.edges[ei];
    if (e) { seenNodes.add(e.from); seenNodes.add(e.to); }
  });

  return (
    <svg className="lp-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={v.takeaway}>
      <defs>
        <marker id={`${uid}d`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" className="lp-flow__arrow" /></marker>
        <marker id={`${uid}a`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" className="lp-flow__arrow is-on" /></marker>
      </defs>
      {v.edges.map((e, i) => {
        const g = geo[i];
        if (!g) return null;
        const on = seenEdges.has(i);
        const now = i === curEdgeIdx;
        return (
          <g key={i} className={`lp-flow__edge${on ? " is-on" : ""}${now ? " is-now" : ""}`}>
            <path d={g.d} fill="none" markerEnd={`url(#${uid}${on ? "a" : "d"})`} />
            {e.label && <text x={g.mid.x} y={g.mid.y - 7} textAnchor="middle" className="lp-flow__label">{plain(e.label)}</text>}
          </g>
        );
      })}
      {v.nodes.map((nd, i) => {
        const c = centers[i];
        if (!c) return null;
        const label = wrap(nd.label, 15);
        const sub = nd.sub ? wrap(nd.sub, 21) : [];
        const total = label.length * 16 + sub.length * 13;
        let y = c.y - total / 2 + 12;
        return (
          <g key={i} className={`lp-flow__node tone-${nd.tone ?? "plain"}${curEdge?.to === i ? " is-active" : ""}${seenNodes.has(i) ? " is-seen" : ""}`}>
            <rect x={c.x - HW} y={c.y - HH} width={HW * 2} height={HH * 2} rx={12} />
            {label.map((l, k) => <text key={`l${k}`} x={c.x} y={(y += k ? 16 : 0)} textAnchor="middle" className="lp-flow__title">{l}</text>)}
            {sub.map((l, k) => <text key={`s${k}`} x={c.x} y={(y += 13 + (k ? 0 : 3))} textAnchor="middle" className="lp-flow__sub">{l}</text>)}
          </g>
        );
      })}
      {curEdgeIdx !== undefined && geo[curEdgeIdx] && (
        <circle r={7} className="lp-token" key={`tok-${s.step}`}>
          <animateMotion dur={dur(s, 0.9)} fill="freeze" path={geo[curEdgeIdx]?.d ?? ""} />
        </circle>
      )}
    </svg>
  );
}
