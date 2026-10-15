import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Rich } from "../Rich.js";
import { compile, evalDefs, fmt, template, type Compiled } from "./expr.js";
import type { BarsVisual, Hue, MatMulVisual, PlotLayer, PlotParam, PlotVisual } from "./types.js";
import type { Stepper } from "./useStepper.js";

type Scope = Record<string, number>;
interface LiveSpec {
  params?: PlotParam[];
  defs?: [string, string][];
  steps?: { note: string; set?: Record<string, number> }[];
}

/**
 * Shared state for the live maths diagrams: slider values, named formulas
 * (defs), and guided steps that glide the sliders to new values.
 */
function useLive(v: LiveSpec, s: Stepper) {
  const params = v.params ?? [];
  const [vals, setVals] = useState<Scope>(() => Object.fromEntries(params.map((p) => [p.name, p.value])));
  const cur = useRef(vals);
  const raf = useRef(0);

  useEffect(() => {
    const set = v.steps?.[s.step]?.set;
    if (!set) return;
    cancelAnimationFrame(raf.current);
    const from = { ...cur.current };
    const to = { ...from, ...set };
    const t0 = performance.now();
    const dur = s.reduced ? 0 : 700;
    const tick = (t: number) => {
      const k = dur ? Math.min(1, (t - t0) / dur) : 1;
      const e = 1 - (1 - k) ** 3;
      const next: Scope = {};
      for (const key of Object.keys(to)) next[key] = (from[key] ?? 0) + ((to[key] ?? 0) - (from[key] ?? 0)) * e;
      cur.current = next;
      setVals(next);
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.step]);

  const names = useMemo(() => ["x", ...params.map((p) => p.name), ...(v.defs ?? []).map(([n]) => n)], [v]);
  const cache = useMemo(() => new Map<string, Compiled>(), []);
  const defs = useMemo(() => (v.defs ?? []).map(([n, e]) => [n, compile(e, names)] as [string, Compiled]), [v, names]);
  const scope = useMemo(() => evalDefs(defs, vals), [defs, vals]);

  const get = (expr: string): Compiled => {
    let fn = cache.get(expr);
    if (!fn) {
      fn = compile(expr, names);
      cache.set(expr, fn);
    }
    return fn;
  };

  return {
    vals,
    scope,
    get,
    cache,
    setParam(name: string, value: number) {
      cancelAnimationFrame(raf.current);
      const next = { ...cur.current, [name]: value };
      cur.current = next;
      setVals(next);
    },
  };
}

function Sliders({ params, vals, onChange }: { params: PlotParam[]; vals: Scope; onChange: (n: string, v: number) => void }) {
  if (!params.length) return null;
  return (
    <div className="lp-sliders">
      {params.map((p) => (
        <label key={p.name}>
          <span>{p.label} <b>{fmt(vals[p.name] ?? p.value, 2)}</b></span>
          <input type="range" min={p.min} max={p.max} step={p.step} value={vals[p.name] ?? p.value} onChange={(e) => onChange(p.name, Number(e.target.value))} />
        </label>
      ))}
    </div>
  );
}

function Readout({ lines, scope, cache }: { lines?: string[]; scope: Scope; cache: Map<string, Compiled> }) {
  if (!lines?.length) return null;
  return (
    <div className="lp-readout" aria-live="polite">
      {lines.map((l, i) => <div key={i}>{template(l, scope, cache)}</div>)}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function niceTicks(min: number, max: number, count = 6): number[] {
  const span = max - min;
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const out: number[] = [];
  for (let t = Math.ceil(min / step) * step; t <= max + step * 1e-6; t += step) out.push(Math.abs(t) < step * 1e-9 ? 0 : t);
  return out;
}

const W = 720;
const H = 400;
const M = { l: 58, r: 20, t: 20, b: 46 };
const hue = (h?: Hue) => `c-${h ?? "accent"}`;

export function PlotDiagram({ v, s }: { v: PlotVisual; s: Stepper }) {
  const uid = useId().replace(/:/g, "");
  const live = useLive(v, s);
  const { scope, get } = live;
  const sx = (x: number) => M.l + ((x - v.xmin) / (v.xmax - v.xmin)) * (W - M.l - M.r);
  const sy = (y: number) => H - M.b - ((y - v.ymin) / (v.ymax - v.ymin)) * (H - M.t - M.b);
  const ev = (expr: string, x = 0) => get(expr)({ ...scope, x });
  const visible = (l: PlotLayer) => !l.show || ev(l.show) > 0;
  const labelText = (l: PlotLayer) => (l.label ? template(l.label, scope, live.cache) : "");

  const xt = niceTicks(v.xmin, v.xmax);
  const yt = niceTicks(v.ymin, v.ymax, 5);

  function curvePath(f: (x: number) => number, a: number, b: number, n = 240) {
    let d = "";
    let pen = false;
    for (let i = 0; i <= n; i++) {
      const x = a + ((b - a) * i) / n;
      const y = f(x);
      if (!Number.isFinite(y) || Math.abs(y) > 1e6) {
        pen = false;
        continue;
      }
      d += `${pen ? "L" : "M"}${sx(x).toFixed(1)} ${sy(y).toFixed(1)} `;
      pen = true;
    }
    return d;
  }

  const draw = (l: PlotLayer, i: number) => {
    if (!visible(l)) return null;
    const cls = `${hue(l.color)}${l.dash ? " is-dash" : ""}`;
    const text = labelText(l);
    switch (l.kind) {
      case "curve": {
        const a = l.from ? ev(l.from) : v.xmin;
        const b = l.to ? ev(l.to) : v.xmax;
        const f = get(l.y);
        return <path key={i} className={`lp-plot__curve ${cls}`} d={curvePath((x) => f({ ...scope, x }), a, b)} clipPath={`url(#${uid})`} />;
      }
      case "fill": {
        const a = ev(l.from);
        const b = ev(l.to);
        const f = get(l.y);
        const baseY = l.base ? get(l.base) : () => 0;
        const n = 80;
        let d = `M${sx(a)} ${sy(baseY({ ...scope, x: a }))} `;
        for (let k = 0; k <= n; k++) {
          const x = a + ((b - a) * k) / n;
          const y = f({ ...scope, x });
          d += `L${sx(x).toFixed(1)} ${sy(Number.isFinite(y) ? y : 0).toFixed(1)} `;
        }
        d += `L${sx(b)} ${sy(baseY({ ...scope, x: b }))}Z`;
        return <path key={i} className={`lp-plot__fill ${cls}`} d={d} clipPath={`url(#${uid})`} />;
      }
      case "point": {
        const x = ev(l.x);
        const y = ev(l.y);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
        return (
          <g key={i} className={`lp-plot__pt ${cls}`}>
            <circle cx={sx(x)} cy={sy(y)} r={6.5} />
            {text && <text x={sx(x) + 10} y={sy(y) - 10}>{text}</text>}
          </g>
        );
      }
      case "line": {
        const x0 = ev(l.x);
        const y0 = ev(l.y);
        const m = ev(l.slope);
        if (![x0, y0, m].every(Number.isFinite)) return null;
        const y1 = y0 + m * (v.xmin - x0);
        const y2 = y0 + m * (v.xmax - x0);
        return (
          <g key={i} className={`lp-plot__curve ${cls}`} clipPath={`url(#${uid})`}>
            <path d={`M${sx(v.xmin)} ${sy(y1)} L${sx(v.xmax)} ${sy(y2)}`} />
            {text && <text className="lp-plot__lab" x={sx(v.xmax) - 8} y={sy(y2) - 8} textAnchor="end">{text}</text>}
          </g>
        );
      }
      case "segment":
      case "arrow": {
        const x1 = ev(l.x1);
        const y1 = ev(l.y1);
        const x2 = ev(l.x2);
        const y2 = ev(l.y2);
        if (![x1, y1, x2, y2].every(Number.isFinite)) return null;
        const [ax, ay, bx, by] = [sx(x1), sy(y1), sx(x2), sy(y2)];
        const ang = Math.atan2(by - ay, bx - ax);
        const hd = 12;
        return (
          <g key={i} className={`lp-plot__curve ${cls}`}>
            <path d={`M${ax} ${ay} L${bx} ${by}`} />
            {l.kind === "arrow" && <path className="lp-plot__head" d={`M${bx} ${by} L${bx - hd * Math.cos(ang - 0.45)} ${by - hd * Math.sin(ang - 0.45)} L${bx - hd * Math.cos(ang + 0.45)} ${by - hd * Math.sin(ang + 0.45)}Z`} />}
            {text && <text className="lp-plot__lab" x={(ax + bx) / 2 + 6} y={(ay + by) / 2 - 8}>{text}</text>}
          </g>
        );
      }
      case "vline": {
        const x = ev(l.x);
        return Number.isFinite(x) ? (
          <g key={i} className={`lp-plot__curve ${cls}`}>
            <path d={`M${sx(x)} ${M.t} V${H - M.b}`} />
            {text && <text className="lp-plot__lab" x={sx(x) + 6} y={M.t + 14}>{text}</text>}
          </g>
        ) : null;
      }
      case "hline": {
        const y = ev(l.y);
        return Number.isFinite(y) ? (
          <g key={i} className={`lp-plot__curve ${cls}`}>
            <path d={`M${M.l} ${sy(y)} H${W - M.r}`} />
            {text && <text className="lp-plot__lab" x={W - M.r - 6} y={sy(y) - 6} textAnchor="end">{text}</text>}
          </g>
        ) : null;
      }
      case "circle": {
        const x = ev(l.x);
        const y = ev(l.y);
        const r = ev(l.r);
        if (![x, y, r].every(Number.isFinite)) return null;
        return <ellipse key={i} className={`lp-plot__curve lp-plot__ring ${cls}`} cx={sx(x)} cy={sy(y)} rx={Math.abs(sx(x + r) - sx(x))} ry={Math.abs(sy(y + r) - sy(y))} clipPath={`url(#${uid})`} />;
      }
      case "polygon": {
        const pts = l.pts.map(([px, py]) => [ev(px), ev(py)] as const);
        if (pts.some(([a, b]) => !Number.isFinite(a) || !Number.isFinite(b))) return null;
        const d = pts.map(([a, b], k) => `${k ? "L" : "M"}${sx(a)} ${sy(b)}`).join(" ") + "Z";
        return <path key={i} className={`lp-plot__curve ${l.fill ? "lp-plot__fill" : ""} ${cls}`} d={d} clipPath={`url(#${uid})`} />;
      }
      case "text": {
        const x = ev(l.x);
        const y = ev(l.y);
        return Number.isFinite(x) && Number.isFinite(y) ? <text key={i} className={`lp-plot__lab ${cls}`} x={sx(x)} y={sy(y)} textAnchor="middle">{text}</text> : null;
      }
    }
  };

  return (
    <div className="lp-plot">
      <svg className="lp-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={v.takeaway}>
        <defs><clipPath id={uid}><rect x={M.l} y={M.t} width={W - M.l - M.r} height={H - M.t - M.b} /></clipPath></defs>
        {xt.map((t) => (
          <g key={`x${t}`}>
            <path className="lp-plot__grid" d={`M${sx(t)} ${M.t} V${H - M.b}`} />
            <text className="lp-plot__tick" x={sx(t)} y={H - M.b + 18} textAnchor="middle">{fmt(t, 2)}</text>
          </g>
        ))}
        {yt.map((t) => (
          <g key={`y${t}`}>
            <path className="lp-plot__grid" d={`M${M.l} ${sy(t)} H${W - M.r}`} />
            <text className="lp-plot__tick" x={M.l - 8} y={sy(t) + 4} textAnchor="end">{fmt(t, 2)}</text>
          </g>
        ))}
        {v.xmin < 0 && v.xmax > 0 && <path className="lp-plot__axis" d={`M${sx(0)} ${M.t} V${H - M.b}`} />}
        {v.ymin < 0 && v.ymax > 0 && <path className="lp-plot__axis" d={`M${M.l} ${sy(0)} H${W - M.r}`} />}
        {v.xlabel && <text className="lp-plot__name" x={(M.l + W - M.r) / 2} y={H - 6} textAnchor="middle">{v.xlabel}</text>}
        {v.ylabel && <text className="lp-plot__name" x={M.l + 6} y={M.t + 12}>{v.ylabel}</text>}
        {v.layers.map(draw)}
      </svg>
      <Sliders params={v.params ?? []} vals={live.vals} onChange={live.setParam} />
      <Readout lines={v.readout} scope={scope} cache={live.cache} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function BarsDiagram({ v, s }: { v: BarsVisual; s: Stepper }) {
  const live = useLive(v, s);
  const max = v.max ?? 1;
  const vals = v.bars.map((b) => live.get(b.value)(live.scope));
  const top = Math.max(...vals);
  return (
    <div className="lp-bars" role="group" aria-label={v.takeaway}>
      {v.bars.map((b, i) => {
        const val = vals[i] ?? 0;
        return (
          <div key={i} className={`lp-bars__row${val === top && v.bars.length > 1 ? " is-top" : ""}`}>
            <span className="lp-bars__label">{b.label}</span>
            <span className="lp-bars__track"><i style={{ width: `${Math.max(0, Math.min(100, (val / max) * 100))}%` }} /></span>
            <b className="lp-bars__val">{v.percent ? `${fmt(val * 100, 1)}%` : fmt(val, 3)}</b>
          </div>
        );
      })}
      <Sliders params={v.params ?? []} vals={live.vals} onChange={live.setParam} />
      <Readout lines={v.readout} scope={live.scope} cache={live.cache} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Grid({ m, name, rowHit, colHit, cellHit, hidden }: { m: (number | null)[][]; name: string; rowHit?: number; colHit?: number; cellHit?: [number, number]; hidden?: (r: number, c: number) => boolean }) {
  return (
    <div className="lp-mm__grid">
      <b>{name}</b>
      <table>
        <tbody>
          {m.map((row, r) => (
            <tr key={r}>
              {row.map((val, c) => {
                const hit = cellHit ? cellHit[0] === r && cellHit[1] === c : rowHit === r || colHit === c;
                return <td key={c} className={`${hit ? "is-hit" : ""}${cellHit && hit ? " is-now" : ""}`}>{hidden?.(r, c) ? "?" : val === null ? "" : fmt(val, 3)}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <small>{m.length} × {m[0]?.length ?? 0}</small>
    </div>
  );
}

export function MatMulDiagram({ v, s }: { v: MatMulVisual; s: Stepper }) {
  const rows = v.a.length;
  const cols = v.b[0]?.length ?? 0;
  const inner = v.b.length;
  const k = Math.min(s.step, rows * cols - 1);
  const r = Math.floor(k / cols);
  const c = k % cols;
  const C = v.a.map((ra) => Array.from({ length: cols }, (_, j) => ra.reduce((sum, a, i) => sum + a * (v.b[i]?.[j] ?? 0), 0) + (v.bias?.[j] ?? 0)));
  const names = v.names ?? ["A", "B", "C"];
  const terms = Array.from({ length: inner }, (_, i) => `${fmt(v.a[r]?.[i] ?? 0, 3)}×${fmt(v.b[i]?.[c] ?? 0, 3)}`).join(" + ");
  const total = C[r]?.[c] ?? 0;
  return (
    <div className="lp-mm" role="group" aria-label={v.takeaway}>
      <div className="lp-mm__row">
        <Grid m={v.a} name={names[0]} rowHit={r} />
        <span className="lp-mm__op">×</span>
        <Grid m={v.b} name={names[1]} colHit={c} />
        <span className="lp-mm__op">=</span>
        <Grid m={C} name={names[2]} cellHit={[r, c]} hidden={(rr, cc) => rr * cols + cc > k} />
      </div>
      <p className="lp-mm__calc">
        <Rich text={`{{${names[2]}[${r + 1}][${c + 1}] = ${terms}${v.bias ? ` + ${fmt(v.bias[c] ?? 0, 3)}` : ""} = ${fmt(total, 3)}}}`} />
      </p>
    </div>
  );
}
