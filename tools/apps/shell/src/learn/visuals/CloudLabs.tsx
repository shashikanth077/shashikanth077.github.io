import { useEffect, useMemo, useState } from "react";
import { Rich, plain } from "../Rich.js";
import { evaluateIam, globMatch, planSubnets, simulateScaling, type StageResult } from "./cloud.js";
import type { ArchNode, ArchVisual, CidrVisual, IamVisual, ScaleVisual } from "./types.js";
import { useStepper, usePrefersReducedMotion, type Stepper } from "./useStepper.js";

/* ================================================================== */
/* Architecture map                                                    */
/* ================================================================== */

const CW = 150;
const CH = 100;
const BW = 128;
const BH = 64;

interface Pt { x: number; y: number }
const centre = (n: ArchNode): Pt => ({ x: n.x * CW + CW / 2, y: n.y * CH + CH / 2 });

/** Point where the line from a box centre toward another point leaves the box. */
function edgeOf(c: Pt, toward: Pt, pad = 4): Pt {
  const dx = toward.x - c.x;
  const dy = toward.y - c.y;
  if (!dx && !dy) return c;
  const t = Math.min((BW / 2 + pad) / (Math.abs(dx) || Infinity), (BH / 2 + pad) / (Math.abs(dy) || Infinity));
  return { x: c.x + dx * t, y: c.y + dy * t };
}

function short(text: string, max: number) {
  const t = plain(text);
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

export function ArchControls({ s }: { s: Stepper }) {
  return (
    <div className="lp-vctl">
      <button type="button" className="lp-btn" onClick={s.prev} disabled={s.step === 0} aria-label="Previous hop">←</button>
      <button type="button" className="lp-btn lp-btn--primary" onClick={s.playing ? s.pause : s.play}>{s.playing ? "Pause" : s.atEnd ? "↻ Replay" : "▶ Play"}</button>
      <button type="button" className="lp-btn" onClick={s.next} disabled={s.atEnd} aria-label="Next hop">→</button>
      <span className="lp-vctl__n" aria-hidden="true">{s.step + 1} / {s.count}</span>
      <span className="lp-bar lp-vctl__bar" aria-hidden="true"><i style={{ width: `${((s.step + 1) / s.count) * 100}%` }} /></span>
    </div>
  );
}

function ArchSvg({ v, flow, s, selected, onSelect, visible }: { v: ArchVisual; flow: ArchVisual["flows"][number] | undefined; s: Stepper | null; selected: string | null; onSelect: (id: string) => void; visible?: Set<string> }) {
  const byId = useMemo(() => new Map(v.nodes.map((n) => [n.id, n])), [v.nodes]);
  const shown = (id: string) => !visible || visible.has(id);
  const step = flow && s ? flow.steps[s.step] : undefined;
  const seen = new Set<string>();
  if (flow && s) flow.steps.slice(0, s.step + 1).forEach((h) => { seen.add(h.from); seen.add(h.to); });
  const W = v.cols * CW;
  const H = v.rows * CH;

  return (
    <svg className="lp-svg ca-arch" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={plain(v.takeaway)}>
      <defs>
        <marker id="ca-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" className="ca-arrowhead" /></marker>
        <marker id="ca-arrow-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" className="ca-arrowhead is-on" /></marker>
      </defs>
      {(v.groups ?? []).map((g, i) => (
        <g key={`g${i}`} className={`ca-group ca-group--${g.tone ?? "vpc"}`}>
          <rect x={g.x * CW + 5} y={g.y * CH + 4} width={g.w * CW - 10} height={g.h * CH - 8} rx={14} />
          <text x={g.x * CW + 16} y={g.y * CH + 18}>{g.label}</text>
        </g>
      ))}
      {v.edges.map(([a, b, label], i) => {
        const na = byId.get(a);
        const nb = byId.get(b);
        if (!na || !nb || !shown(a) || !shown(b)) return null;
        const p1 = edgeOf(centre(na), centre(nb));
        const p2 = edgeOf(centre(nb), centre(na), 6);
        const on = !!step && ((step.from === a && step.to === b) || (step.from === b && step.to === a));
        return (
          <g key={`e${i}`} className={`ca-edge${on ? " is-on" : ""}`}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} markerEnd={`url(#${on ? "ca-arrow-on" : "ca-arrow"})`} />
            {label && <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 - 5} textAnchor="middle">{label}</text>}
          </g>
        );
      })}
      {v.nodes.filter((n) => shown(n.id)).map((n) => {
        const c = centre(n);
        const active = !!step && (step.from === n.id || step.to === n.id);
        const cls = `ca-node ca-k-${n.kind}${active ? " is-active" : ""}${seen.has(n.id) ? " is-seen" : ""}${selected === n.id ? " is-selected" : ""}`;
        return (
          <g
            key={n.id}
            className={cls}
            role="button"
            tabIndex={0}
            aria-label={`${n.label}: ${plain(n.info)}`}
            onClick={() => onSelect(n.id)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(n.id); } }}
          >
            <rect x={c.x - BW / 2} y={c.y - BH / 2} width={BW} height={BH} rx={12} />
            <text x={c.x - BW / 2 + 12} y={c.y + 7} className="ca-node__icon">{n.icon}</text>
            <text x={c.x - BW / 2 + 42} y={n.sub ? c.y - 3 : c.y + 5} className="ca-node__label">{short(n.label, 14)}</text>
            {n.sub && <text x={c.x - BW / 2 + 42} y={c.y + 14} className="ca-node__sub">{short(n.sub, 16)}</text>}
          </g>
        );
      })}
      {step && s && byId.get(step.from) && byId.get(step.to) && (() => {
        const a = centre(byId.get(step.from) as ArchNode);
        const b = centre(byId.get(step.to) as ArchNode);
        const d = s.reduced ? "0.01s" : "0.8s";
        return (
          <circle r={8} className={`lp-token${step.bad ? " ca-token--bad" : ""}`} key={`tok-${flow?.name}-${s.step}`}>
            <animate attributeName="cx" from={a.x} to={b.x} dur={d} fill="freeze" />
            <animate attributeName="cy" from={a.y} to={b.y} dur={d} fill="freeze" />
          </circle>
        );
      })()}
    </svg>
  );
}

function FlowPlayer({ v, flowIndex, selected, onSelect, visible }: { v: ArchVisual; flowIndex: number; selected: string | null; onSelect: (id: string) => void; visible?: Set<string> }) {
  const flow = v.flows[flowIndex];
  const s = useStepper(Math.max(1, flow?.steps.length ?? 1), 1900);
  const step = flow?.steps[s.step];
  return (
    <>
      <div className="ca-scroll"><ArchSvg v={v} flow={flow} s={s} selected={selected} onSelect={onSelect} visible={visible} /></div>
      {flow && <ArchControls s={s} />}
      {step && <p className={`lp-vcap${step.bad ? " ca-cap--bad" : ""}`} aria-live="polite"><Rich text={step.note} /></p>}
    </>
  );
}

/** Clickable architecture map with animated request flows. */
export function ArchDiagram({ v, visible }: { v: ArchVisual; visible?: Set<string> }) {
  const [flowIndex, setFlowIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const node = v.nodes.find((n) => n.id === selected);
  return (
    <div className="ca-archwrap">
      {v.flows.length > 1 && (
        <div className="ca-tabs" role="tablist" aria-label="Request flows">
          {v.flows.map((f, i) => (
            <button key={f.name} type="button" role="tab" aria-selected={flowIndex === i} onClick={() => setFlowIndex(i)}>{f.name}</button>
          ))}
        </div>
      )}
      <FlowPlayer key={flowIndex} v={v} flowIndex={flowIndex} selected={selected} onSelect={(id) => setSelected((cur) => (cur === id ? null : id))} visible={visible} />
      <div className={`ca-info${node ? " is-open" : ""}`} aria-live="polite">
        {node ? (
          <>
            <span className={`ca-info__icon ca-k-${node.kind}`} aria-hidden="true">{node.icon}</span>
            <div><b>{node.label}</b>{node.sub && <small> · {node.sub}</small>}<p><Rich text={node.info} /></p></div>
            <button type="button" className="ca-info__close" onClick={() => setSelected(null)} aria-label="Close details">×</button>
          </>
        ) : (
          <span className="ca-info__hint">Tip: click any service box to see what it does here.</span>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/* IAM policy evaluator                                                */
/* ================================================================== */

const KIND_NAME: Record<IamVisual["policies"][number]["kind"], string> = {
  identity: "Identity policy",
  resource: "Resource policy",
  boundary: "Permissions boundary",
  scp: "SCP (Organizations)",
  session: "Session policy",
};
const STAGE_ICON: Record<StageResult, string> = { allow: "✓", pass: "✓", deny: "✕", skip: "–", none: "○" };

export function IamLab({ v }: { v: IamVisual }) {
  const [req, setReq] = useState(0);
  const [on, setOn] = useState(() => v.policies.map((p) => p.on !== false));
  const r = v.requests[req] ?? v.requests[0];
  const decision = r ? evaluateIam(v, on, r.action, r.resource) : null;
  const matches = (actions: string[], resources: string[]) =>
    !!r && actions.some((a) => globMatch(a, r.action, true)) && resources.some((x) => globMatch(x, r.resource));

  return (
    <div className="ca-iam">
      <p className="ca-iam__who"><span>Principal</span><code>{v.principal}</code></p>
      <div className="ca-tabs" role="group" aria-label="Request to evaluate">
        {v.requests.map((q, i) => (
          <button key={q.label} type="button" aria-pressed={req === i} onClick={() => setReq(i)}>{q.label}</button>
        ))}
      </div>
      {r && <p className="ca-iam__req"><code>{r.action}</code> on <code>{r.resource}</code></p>}
      <div className="ca-iam__grid">
        <div className="ca-iam__pols">
          {v.policies.map((p, i) => (
            <div key={p.name} className={`ca-pol${on[i] ? "" : " is-off"}`}>
              <label className="ca-pol__head">
                <input type="checkbox" checked={on[i]} onChange={() => setOn((o) => o.map((x, k) => (k === i ? !x : x)))} />
                <b>{p.name}</b>
                <span className={`ca-pol__kind ca-pol__kind--${p.kind}`}>{KIND_NAME[p.kind]}</span>
              </label>
              <ul>
                {p.statements.map((st, k) => {
                  const hit = on[i] && matches(st.actions, st.resources);
                  return (
                    <li key={k} className={`${st.effect === "Deny" ? "is-deny" : "is-allow"}${hit ? " is-hit" : ""}`}>
                      <b>{st.effect}</b> <code>{st.actions.join(", ")}</code> on <code>{st.resources.join(", ")}</code>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        {decision && (
          <div className="ca-iam__eval">
            <ol>
              {decision.stages.map((st) => (
                <li key={st.key} className={`is-${st.result}`}>
                  <i aria-hidden="true">{STAGE_ICON[st.result]}</i>
                  <span><b>{st.label}</b><small>{st.detail}</small></span>
                </li>
              ))}
            </ol>
            <div className={`ca-verdict ${decision.allowed ? "is-allow" : "is-deny"}`} aria-live="polite">
              <b>{decision.allowed ? "ALLOWED" : "DENIED"}</b>
              <span>{decision.reason}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/* VPC / CIDR planner                                                  */
/* ================================================================== */

const TIER_TONE = ["ca-tier--0", "ca-tier--1", "ca-tier--2", "ca-tier--3"];

export function CidrLab({ v }: { v: CidrVisual }) {
  const [vp, setVp] = useState(v.vpcPrefix);
  const [sp, setSp] = useState(v.subnetPrefix);
  const [azs, setAzs] = useState(v.azs);
  const subnet = Math.max(sp, vp);
  const plan = planSubnets(v.base, vp, subnet, azs, v.tiers);
  const usedPct = Math.min(100, (Math.min(plan.needed, plan.available) / Math.max(1, plan.available)) * 100);

  return (
    <div className="ca-cidr">
      <div className="ca-sliders">
        <label>VPC size <b>/{vp}</b> <small>{plan.vpcSize.toLocaleString()} addresses</small>
          <input type="range" min={16} max={28} value={vp} onChange={(e) => setVp(Number(e.target.value))} /></label>
        <label>Subnet size <b>/{subnet}</b> <small>{plan.usable.toLocaleString()} usable each</small>
          <input type="range" min={16} max={28} value={subnet} onChange={(e) => setSp(Number(e.target.value))} /></label>
        <label>Availability Zones <b>{azs}</b>
          <input type="range" min={1} max={3} value={azs} onChange={(e) => setAzs(Number(e.target.value))} /></label>
      </div>
      <div className={`ca-cidr__status ${plan.fits ? "tone-good" : "tone-bad"}`}>
        {plan.fits
          ? <>VPC <code>{plan.vpc}</code> holds <b>{plan.available}</b> subnets of /{subnet}; this design uses <b>{plan.needed}</b> ({v.tiers.length} tiers × {azs} AZ{azs > 1 ? "s" : ""}), leaving {plan.available - plan.needed} free for later.</>
          : <>Does not fit: {v.tiers.length} tiers × {azs} AZs need <b>{plan.needed}</b> subnets of /{subnet}, but <code>{plan.vpc}</code> only holds <b>{plan.available}</b>. Make the VPC bigger or the subnets smaller.</>}
      </div>
      <div className="ca-cidr__bar" aria-hidden="true"><i style={{ width: `${usedPct}%` }} /></div>
      <div className="ca-cidr__table">
        <table>
          <thead><tr><th>Tier</th>{Array.from({ length: azs }, (_, a) => <th key={a}>AZ {String.fromCharCode(97 + a)}</th>)}</tr></thead>
          <tbody>
            {v.tiers.map((tier, ti) => (
              <tr key={tier}>
                <th><span className={`ca-tier ${TIER_TONE[ti % 4]}`}>{tier}</span></th>
                {Array.from({ length: azs }, (_, a) => {
                  const sn = plan.subnets.find((x) => x.tier === tier && x.az === a);
                  return <td key={a}>{sn ? <><code>{sn.cidr}</code><small>{sn.first} – {sn.last}</small></> : <span className="ca-cidr__none">no room</span>}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ca-note">Each subnet loses 5 addresses to AWS (network, router, DNS, reserved, broadcast), so the first usable host is <code>.4</code> into the block.</p>
    </div>
  );
}

/* ================================================================== */
/* Auto scaling simulator                                              */
/* ================================================================== */

export function ScaleLab({ v }: { v: ScaleVisual }) {
  const reduced = usePrefersReducedMotion();
  const [target, setTarget] = useState(v.target);
  const [min, setMin] = useState(v.min);
  const [max, setMax] = useState(v.max);
  const [warmup, setWarmup] = useState(v.warmup);
  const ticks = useMemo(() => simulateScaling(v, target, min, Math.max(min, max), warmup), [v, target, min, max, warmup]);
  const [at, setAt] = useState(reduced ? ticks.length - 1 : 0);
  const [playing, setPlaying] = useState(!reduced);

  useEffect(() => {
    if (!playing) return;
    if (at >= ticks.length - 1) { setPlaying(false); return; }
    const id = setTimeout(() => setAt((a) => a + 1), 180);
    return () => clearTimeout(id);
  }, [playing, at, ticks.length]);
  useEffect(() => setAt((a) => Math.min(a, ticks.length - 1)), [ticks.length]);

  const W = 640;
  const H = 210;
  const pad = { l: 44, r: 12, t: 12, b: 24 };
  const peak = Math.max(...v.pattern, ...ticks.map((t) => t.ready * v.capacityPer)) * 1.08;
  const X = (t: number) => pad.l + (t / Math.max(1, ticks.length - 1)) * (W - pad.l - pad.r);
  const Y = (r: number) => H - pad.b - (r / peak) * (H - pad.t - pad.b);
  const shown = ticks.slice(0, at + 1);
  const trafficPath = shown.map((t, i) => `${i ? "L" : "M"}${X(t.t).toFixed(1)},${Y(t.traffic).toFixed(1)}`).join(" ");
  const capPath = shown.map((t, i) => `${i ? "L" : "M"}${X(t.t).toFixed(1)},${Y(t.ready * v.capacityPer).toFixed(1)}`).join(" ");
  const cur = ticks[at];
  const overMinutes = shown.filter((t) => t.overload > 0).length;
  const unitMinutes = shown.reduce((sum, t) => sum + t.ready + t.pending, 0);
  const dropped = shown.reduce((sum, t) => sum + t.overload, 0);

  return (
    <div className="ca-scale">
      <svg className="lp-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={plain(v.takeaway)}>
        {[0.25, 0.5, 0.75, 1].map((f) => <line key={f} className="ca-grid" x1={pad.l} x2={W - pad.r} y1={Y(peak * f / 1.08)} y2={Y(peak * f / 1.08)} />)}
        {[0.5, 1].map((f) => <text key={f} className="ca-axis" x={pad.l - 6} y={Y(peak * f / 1.08) + 4} textAnchor="end">{Math.round(peak * f / 1.08)}</text>)}
        <text className="ca-axis" x={pad.l} y={H - 6}>minute 0</text>
        <text className="ca-axis" x={W - pad.r} y={H - 6} textAnchor="end">minute {ticks.length - 1}</text>
        {shown.filter((t) => t.overload > 0).map((t) => (
          <rect key={t.t} className="ca-over" x={X(t.t) - 3} width={6} y={Y(t.traffic)} height={Math.max(1, Y(t.ready * v.capacityPer) - Y(t.traffic))} />
        ))}
        <path d={capPath} className="ca-cap" />
        <path d={trafficPath} className="ca-traffic" />
        {cur && <line className="ca-head" x1={X(cur.t)} x2={X(cur.t)} y1={pad.t} y2={H - pad.b} />}
      </svg>
      <div className="ca-scale__legend"><span className="is-traffic">requests / s</span><span className="is-cap">capacity of ready {v.unit}s</span><span className="is-over">overloaded</span></div>
      {cur && (
        <div className="ca-scale__now">
          <div className="ca-units" aria-label={`${cur.ready} ready, ${cur.pending} warming up`}>
            {Array.from({ length: cur.ready }, (_, i) => <i key={`r${i}`} className="is-ready" />)}
            {Array.from({ length: cur.pending }, (_, i) => <i key={`p${i}`} className="is-pending" />)}
          </div>
          <span>min {cur.t}: <b>{cur.traffic}</b> req/s · <b>{cur.ready}</b> ready{cur.pending ? <> + {cur.pending} warming</> : null} · utilisation <b className={cur.util > 100 ? "is-bad" : ""}>{cur.util >= 999 ? "∞" : `${Math.round(cur.util)}%`}</b></span>
        </div>
      )}
      <div className="ca-sliders">
        <label>Target utilisation <b>{target}%</b><input type="range" min={30} max={95} step={5} value={target} onChange={(e) => setTarget(Number(e.target.value))} /></label>
        <label>Minimum {v.unit}s <b>{min}</b><input type="range" min={1} max={8} value={min} onChange={(e) => setMin(Number(e.target.value))} /></label>
        <label>Maximum <b>{Math.max(min, max)}</b><input type="range" min={1} max={20} value={max} onChange={(e) => setMax(Number(e.target.value))} /></label>
        <label>Warm-up <b>{warmup} min</b><input type="range" min={0} max={6} value={warmup} onChange={(e) => setWarmup(Number(e.target.value))} /></label>
      </div>
      <div className="ca-scale__stats">
        <span>overloaded minutes <b className={overMinutes ? "is-bad" : ""}>{overMinutes}</b></span>
        <span>requests not served in time <b className={dropped ? "is-bad" : ""}>{Math.round(dropped).toLocaleString()}</b></span>
        <span>{v.unit}-minutes billed <b>{unitMinutes}</b></span>
        <button type="button" className="lp-btn" onClick={() => { if (at >= ticks.length - 1) setAt(0); setPlaying((p) => !p); }}>{playing ? "Pause" : at >= ticks.length - 1 ? "↻ Replay" : "▶ Play"}</button>
      </div>
    </div>
  );
}
