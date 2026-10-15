import { useEffect, useState } from "react";
import type { LearnCtx } from "../ctx.js";
import { Rich } from "../Rich.js";

type Op = "read" | "write";

function Dots({ value, label }: { value: number; label: string }) {
  return (
    <span className="lp-dots" role="img" aria-label={`${label}: ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= value ? "on" : ""} />)}
    </span>
  );
}

/** Step-through explorer for a stack's patterns (e.g. Redis caching strategies). */
export function Patterns({ ctx }: { ctx: LearnCtx }) {
  const patterns = ctx.data.patterns;
  const { params, setParam } = ctx;
  const items = patterns?.items ?? [];
  const index = Math.max(0, items.findIndex((p) => p.name === params.get("p")));
  const op: Op = params.get("op") === "write" ? "write" : "read";
  const pattern = items[index];
  const steps = pattern ? pattern[op] : [];

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Reset the walkthrough whenever the pattern or operation changes.
  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [index, op]);

  useEffect(() => {
    if (!playing) return;
    if (step >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1100);
    return () => clearTimeout(t);
  }, [playing, step, steps.length]);

  if (!patterns || !pattern) return null;

  return (
    <div className="lp-stack">
      <p className="lp-muted lp-lead">Every pattern answers two questions: who talks to the data store, and when. Choose a pattern and an operation, then step through one request.</p>

      <div className="lp-subtabs" role="tablist" aria-label="Pattern">
        {items.map((p) => (
          <button key={p.name} type="button" role="tab" aria-selected={p.name === pattern.name} onClick={() => setParam("p", p.name)}>{p.name}</button>
        ))}
      </div>

      <section className="lp-card lp-pattern">
        <p className="lp-pattern__desc"><Rich text={pattern.description} /></p>

        <div className="lp-pattern__bar">
          <div className="lp-chips" role="group" aria-label="Operation">
            {(["read", "write"] as const).map((o) => (
              <button key={o} type="button" aria-pressed={op === o} onClick={() => setParam("op", o === "read" ? null : o)}>{o === "read" ? "Read path" : "Write path"}</button>
            ))}
          </div>
          <div className="lp-pattern__ctl">
            <button type="button" className="lp-btn" disabled={step === 0} onClick={() => { setPlaying(false); setStep(step - 1); }}>← Back</button>
            <button type="button" className="lp-btn lp-btn--primary" onClick={() => { if (playing) setPlaying(false); else { if (step >= steps.length - 1) setStep(0); setPlaying(true); } }}>
              {playing ? "Pause" : step >= steps.length - 1 && step > 0 ? "Replay" : "Play"}
            </button>
            <button type="button" className="lp-btn" disabled={step >= steps.length - 1} onClick={() => { setPlaying(false); setStep(step + 1); }}>Next →</button>
          </div>
        </div>

        <ol className="lp-steps" aria-live="polite">
          {steps.map((s, i) => (
            <li key={`${op}-${i}`} className={i < step ? "is-past" : i === step ? "is-now" : ""}>
              <span className="lp-steps__n">{i + 1}</span>
              <div><b>{s.actor}</b><span>{s.action}</span></div>
            </li>
          ))}
        </ol>

        <div className="lp-twin">
          <div>
            <h4>How it scores</h4>
            <div className="lp-rate">
              {patterns.ratingLabels.map((l, i) => (
                <div key={l}><span>{l}</span><Dots value={pattern.ratings[i] ?? 0} label={l} /></div>
              ))}
            </div>
            <p className="lp-muted lp-note">Scores from 1 to 5 are judgement calls for general guidance.</p>
          </div>
          <div className="lp-fit">
            <section className="lp-callout lp-callout--prod"><h4>Use it when</h4><p><Rich text={pattern.useWhen} /></p></section>
            <section className="lp-callout lp-callout--risk"><h4>Watch out for</h4><p><Rich text={pattern.watchOut} /></p></section>
          </div>
        </div>
      </section>

      <section>
        <h3 className="lp-sub">Compare all patterns</h3>
        <div className="lp-table">
          <table>
            <thead><tr><th>Pattern</th>{patterns.ratingLabels.map((l) => <th key={l}>{l}</th>)}</tr></thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.name}>
                  <th scope="row"><button type="button" className="lp-link" onClick={() => { setParam("p", p.name); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{p.name}</button></th>
                  {patterns.ratingLabels.map((l, i) => <td key={l}><Dots value={p.ratings[i] ?? 0} label={l} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
