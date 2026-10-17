import { useEffect, useMemo, useState } from "react";
import { decide, feed, summarise, type Decision } from "./fraud.js";
import type { StreamVisual } from "./types.js";
import { usePrefersReducedMotion } from "./useStepper.js";

const MAX = 1500;
const BATCH = 4;
const money = (n: number) => `${n < 0 ? "−" : ""}${Math.abs(Math.round(n)).toLocaleString()}`;
const pct = (x: number) => `${(x * 100).toFixed(x >= 0.995 || x === 0 ? 0 : 1)}%`;
const LABEL: Record<Decision, string> = { approve: "approve", review: "review", decline: "decline" };

/** Histogram of scores split by truth, with the two decision thresholds drawn on it. */
function Histogram({ txns, reviewAt, declineAt }: { txns: ReturnType<typeof feed>; reviewAt: number; declineAt: number }) {
  const bins = 25;
  const legit = Array<number>(bins).fill(0);
  const fraud = Array<number>(bins).fill(0);
  for (const t of txns) (t.fraud ? fraud : legit)[Math.min(bins - 1, Math.floor(t.score * bins))]!++;
  const peak = Math.max(1, ...legit, ...fraud);
  const W = 520;
  const H = 120;
  const bw = W / bins;
  const h = (n: number) => (n ? Math.max(2, Math.sqrt(n / peak) * (H - 18)) : 0);
  return (
    <svg className="lp-svg fr-hist" viewBox={`0 0 ${W} ${H + 18}`} role="img" aria-label="Distribution of model scores for good and fraudulent transactions">
      <rect x={reviewAt * W} y={0} width={Math.max(0, (declineAt - reviewAt) * W)} height={H} className="fr-zone fr-zone--review" />
      <rect x={declineAt * W} y={0} width={W - declineAt * W} height={H} className="fr-zone fr-zone--decline" />
      {legit.map((n, i) => <rect key={`l${i}`} x={i * bw + 1} y={H - h(n)} width={bw / 2 - 1} height={h(n)} className="fr-bar fr-bar--legit" />)}
      {fraud.map((n, i) => <rect key={`f${i}`} x={i * bw + bw / 2} y={H - h(fraud[i] ?? 0)} width={bw / 2 - 1} height={h(n)} className="fr-bar fr-bar--fraud" />)}
      <line x1={reviewAt * W} x2={reviewAt * W} y1={0} y2={H} className="fr-line fr-line--review" />
      <line x1={declineAt * W} x2={declineAt * W} y1={0} y2={H} className="fr-line fr-line--decline" />
      <text x={4} y={H + 13} className="fr-axis">score 0 (looks normal)</text>
      <text x={W - 4} y={H + 13} textAnchor="end" className="fr-axis">1 (looks like fraud)</text>
    </svg>
  );
}

export function StreamLab({ v }: { v: StreamVisual }) {
  const reduced = usePrefersReducedMotion();
  const [fraudRate, setFraudRate] = useState(v.fraudRate);
  const [sep, setSep] = useState(v.separation);
  const [reviewAt, setReviewAt] = useState(v.reviewAt);
  const [declineAt, setDeclineAt] = useState(v.declineAt);
  const [count, setCount] = useState(reduced ? MAX : 0);
  const [running, setRunning] = useState(!reduced);

  const txns = useMemo(() => feed(MAX, fraudRate, sep), [fraudRate, sep]);
  const seen = txns.slice(0, count);
  const sum = useMemo(() => summarise(seen, v, reviewAt, declineAt), [seen, v, reviewAt, declineAt]);

  useEffect(() => {
    if (!running) return;
    if (count >= MAX) { setRunning(false); return; }
    const id = setTimeout(() => setCount((c) => Math.min(MAX, c + BATCH)), 120);
    return () => clearTimeout(id);
  }, [running, count]);

  const restart = () => { setCount(0); setRunning(true); };
  const saved = sum.baseline - sum.total;
  const last = seen.slice(-9).reverse();

  return (
    <div className="fr" role="group" aria-label={v.takeaway}>
      <div className="fr-tiles">
        <div className="fr-tile is-good"><b>{sum.caught}<small> / {sum.fraud}</small></b><span>fraud stopped ({pct(sum.recall)})</span></div>
        <div className="fr-tile is-bad"><b>{sum.missed}</b><span>fraud got through · {money(sum.fraudLoss)} lost</span></div>
        <div className="fr-tile is-warn"><b>{sum.falseDeclines}</b><span>good customers blocked · {money(sum.falseDeclineLoss)} cost</span></div>
        <div className={`fr-tile ${saved >= 0 ? "is-good" : "is-bad"}`}><b>{saved >= 0 ? "+" : ""}{money(saved)}</b><span>saved vs no model (cost {money(sum.total)})</span></div>
      </div>

      <div className="fr-main">
        <div className="fr-left">
          <Histogram txns={seen} reviewAt={reviewAt} declineAt={declineAt} />
          <div className="fr-legend"><span className="is-legit">good</span><span className="is-fraud">fraud</span><span className="is-review">sent to a person</span><span className="is-decline">declined</span></div>
          <div className="fr-sliders">
            <label>Send to review at <b>{reviewAt.toFixed(2)}</b>
              <input type="range" min={0.02} max={0.98} step={0.01} value={reviewAt} onChange={(e) => { const x = Number(e.target.value); setReviewAt(x); if (x > declineAt) setDeclineAt(x); }} /></label>
            <label>Decline at <b>{declineAt.toFixed(2)}</b>
              <input type="range" min={0.02} max={1} step={0.01} value={declineAt} onChange={(e) => { const x = Number(e.target.value); setDeclineAt(x); if (x < reviewAt) setReviewAt(x); }} /></label>
            <label>Model quality <b>{sep.toFixed(1)}</b> <small>1 weak · 8 excellent</small>
              <input type="range" min={1} max={8} step={0.5} value={sep} onChange={(e) => { setSep(Number(e.target.value)); restart(); }} /></label>
            <label>Fraud share <b>{fraudRate.toFixed(1)}%</b> <small>real life ≈ 0.1%</small>
              <input type="range" min={0.5} max={6} step={0.5} value={fraudRate} onChange={(e) => { setFraudRate(Number(e.target.value)); restart(); }} /></label>
          </div>
        </div>

        <div className="fr-feed" aria-live="off">
          <div className="fr-feed__head"><span>#</span><span>merchant</span><span>amount</span><span>score</span><span>decision</span></div>
          {last.map((t) => {
            const d = decide(t.score, reviewAt, declineAt);
            return (
              <div key={t.id} className={`fr-row is-${d}${t.fraud ? " is-fraud" : ""}`}>
                <span>{t.id}</span>
                <span>{t.merchant}</span>
                <span>{t.amount.toFixed(2)}</span>
                <span className="fr-score"><i style={{ width: `${t.score * 100}%` }} /><em>{Math.round(t.score * 100)}</em></span>
                <span className="fr-chip">{LABEL[d]}{t.fraud ? " · fraud" : ""}</span>
              </div>
            );
          })}
          {last.length === 0 && <div className="fr-row"><span>waiting for transactions…</span></div>}
        </div>
      </div>

      <div className="fr-foot">
        <span>{sum.n.toLocaleString()} transactions · approved <b>{pct(sum.approvalRate)}</b> · precision <b>{pct(sum.precision)}</b> · {sum.reviewed} in review</span>
        <button type="button" className="lp-btn" onClick={() => setRunning((r) => !r)} disabled={count >= MAX}>{running ? "Pause" : "Run"}</button>
        <button type="button" className="lp-btn" onClick={restart}>Restart</button>
      </div>
    </div>
  );
}
