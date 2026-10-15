import { useState } from "react";
import type { LearnCtx } from "../ctx.js";
import { CodeBlock, Rich } from "../Rich.js";
import type { Drill } from "../types.js";
import { SubTabs } from "../SubTabs.js";

function DrillCard({ drill, id, ctx }: { drill: Drill; id: string; ctx: LearnCtx }) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const solved = !!ctx.progress.solved[id];

  function pick(i: number) {
    if (answered) return;
    setPicked(i);
    if (drill.options[i]?.correct) ctx.toggle("solved", id, true);
  }

  return (
    <article className={`lp-card lp-drill${solved ? " is-done" : ""}`}>
      <header>
        <h3>{drill.title}{solved && <span className="lp-badge">✓ diagnosed</span>}</h3>
        <p><Rich text={drill.context} /></p>
      </header>
      <ul className="lp-symptoms">{drill.symptoms.map((s) => <li key={s}><Rich text={s} /></li>)}</ul>
      <p className="lp-label">What is the most likely cause?</p>
      <div className="lp-options" role="group" aria-label="Choose the most likely cause">
        {drill.options.map((o, i) => {
          const state = !answered ? "" : o.correct ? " is-right" : picked === i ? " is-wrong" : "";
          return (
            <div key={o.text}>
              <button type="button" className={`lp-option${state}`} disabled={answered} onClick={() => pick(i)}>
                <span aria-hidden="true">{answered ? (o.correct ? "✓" : picked === i ? "✕" : "·") : String.fromCharCode(65 + i)}</span>
                <Rich text={o.text} />
              </button>
              {answered && (picked === i || o.correct) && <p className="lp-why"><Rich text={o.why} /></p>}
            </div>
          );
        })}
      </div>
      {answered && (
        <div className="lp-reveal">
          <h4>Diagnosis path</h4>
          <ol>{drill.path.map((p) => <li key={p}><Rich text={p} /></li>)}</ol>
          <div className="lp-twin">
            <section className="lp-callout lp-callout--prod"><h4>The fix</h4><p><Rich text={drill.fix} /></p></section>
            <section className="lp-callout"><h4>Prevent it</h4><p><Rich text={drill.prevent} /></p></section>
          </div>
          <section className="lp-callout lp-callout--int"><h4>Say this in the interview</h4><p><Rich text={drill.interview} /></p></section>
          <button type="button" className="lp-btn" onClick={() => setPicked(null)}>Try again</button>
        </div>
      )}
    </article>
  );
}

export function Practice({ ctx }: { ctx: LearnCtx }) {
  const { data, params, setParam } = ctx;
  const tabs = [
    ...(data.drills ? [{ id: "drills", label: `Production drills (${data.drills.length})` }] : []),
    ...(data.codeLab ? [{ id: "code", label: `Code lab (${data.codeLab.length})` }] : []),
    ...(data.architecture ? [{ id: "system", label: "System map" }] : []),
  ];
  const sub = tabs.find((t) => t.id === params.get("sub"))?.id ?? tabs[0]?.id;
  const [shown, setShown] = useState<Record<number, boolean>>({});

  return (
    <div className="lp-stack">
      <SubTabs tabs={tabs} value={sub} onChange={(v) => setParam("sub", v)} />

      {sub === "drills" && data.drills && (
        <>
          <p className="lp-muted lp-lead">Senior interviews often start with a symptom, not a question. Pick the most likely cause, then read the diagnosis path and how to talk about it.</p>
          {data.drills.map((d, i) => <DrillCard key={d.title} drill={d} id={`d${i}`} ctx={ctx} />)}
          {data.incidents && (
            <>
              <h3 className="lp-sub">Real incidents worth knowing</h3>
              <div className="lp-tiles">
                {data.incidents.map((inc) => <div key={inc.title} className="lp-card"><strong>{inc.title}</strong><p className="lp-muted">{inc.body}</p></div>)}
              </div>
            </>
          )}
        </>
      )}

      {sub === "code" && data.codeLab && (
        <>
          <p className="lp-muted lp-lead">Utilities that show up in live-coding rounds and real codebases. Write each from memory first, then open the solution.</p>
          {data.codeLab.map((c, i) => (
            <article key={c.title} className="lp-card">
              <h3>{c.title}</h3>
              <p className="lp-muted">{c.brief}</p>
              {shown[i] ? (
                <CodeBlock code={c.code} label="Solution" />
              ) : (
                <button type="button" className="lp-btn" onClick={() => setShown({ ...shown, [i]: true })}>Reveal solution</button>
              )}
            </article>
          ))}
        </>
      )}

      {sub === "system" && data.architecture && (
        <>
          <p className="lp-muted lp-lead">Walk a request through the system. For each component: what it does, how it fails, and the question an interviewer will ask.</p>
          <ol className="lp-flow">
            {data.architecture.map((a) => (
              <li key={a.name} className="lp-card">
                <h3>{a.name}</h3>
                <p>{a.role}</p>
                <p className="lp-risk"><b>Failure mode:</b> {a.risk}</p>
                <p className="lp-ask"><b>Expect:</b> {a.question}</p>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
