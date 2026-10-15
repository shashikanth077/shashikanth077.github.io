import { useMemo } from "react";
import type { LearnCtx } from "../ctx.js";
import { countDone } from "../progress.js";
import { LEVEL_LABEL, type Level } from "../types.js";

function Ring({ pct }: { pct: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg className="lp-ring" viewBox="0 0 120 120" role="img" aria-label={`${pct}% of concepts studied`}>
      <circle cx="60" cy="60" r={r} className="lp-ring__track" />
      <circle cx="60" cy="60" r={r} className="lp-ring__bar" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 60 60)" />
      <text x="60" y="58" textAnchor="middle" className="lp-ring__pct">{pct}%</text>
      <text x="60" y="76" textAnchor="middle" className="lp-ring__sub">studied</text>
    </svg>
  );
}

const LEVEL_BLURB: Record<Level, string> = {
  1: "The fundamentals every interview assumes you know.",
  2: "What teams expect from a working professional.",
  3: "Depth that separates senior from mid-level.",
};

export function Overview({ ctx }: { ctx: LearnCtx }) {
  const { data, progress, go, stack } = ctx;
  const ids = data.concepts.map((c) => c.id);
  const done = countDone(progress.studied, ids);
  const pct = ids.length ? Math.round((done / ids.length) * 100) : 0;

  const next = useMemo(
    () => data.concepts.find((c) => !progress.studied[c.id] && c.level === 1) ?? data.concepts.find((c) => !progress.studied[c.id]),
    [data, progress.studied],
  );

  const levels = ([1, 2, 3] as Level[]).map((lv) => {
    const list = data.concepts.filter((c) => c.level === lv);
    return { lv, total: list.length, done: countDone(progress.studied, list.map((c) => c.id)) };
  });

  const areas = data.areas.map((a) => {
    const list = data.concepts.filter((c) => c.area === a.id);
    return { ...a, total: list.length, done: countDone(progress.studied, list.map((c) => c.id)) };
  });

  const known = countDone(progress.known, data.questions.map((q) => q.id));
  const solved = data.drills ? countDone(progress.solved, data.drills.map((_, i) => `d${i}`)) : 0;

  return (
    <div className="lp-stack">
      <section className="lp-card lp-progress">
        <Ring pct={pct} />
        <div>
          <span className="lp-eyebrow">YOUR PROGRESS</span>
          <h2>
            {done === 0
              ? `Start learning ${stack.name}`
              : done === ids.length
                ? "You have covered everything"
                : `${done} of ${ids.length} concepts studied`}
          </h2>
          <p className="lp-muted">Tick concepts as you study them. Progress is saved in this browser only — nothing is uploaded.</p>
          <div className="lp-actions">
            {next && (
              <button className="lp-btn lp-btn--primary" type="button" onClick={() => go("learn", { area: next.area, open: next.id })}>
                {done === 0 ? "Start with" : "Continue:"} {next.title}
              </button>
            )}
            <button className="lp-btn" type="button" onClick={() => go("interview", { sub: "mock" })}>Try a mock interview</button>
          </div>
        </div>
      </section>

      <section>
        <div className="lp-head"><div><span className="lp-eyebrow">LEARNING PATH</span><h2>Three levels, in order</h2></div></div>
        <ol className="lp-path">
          {levels.map(({ lv, total, done: d }) => (
            <li key={lv} className="lp-card">
              <span className={`lp-level lp-level--${lv}`}>{LEVEL_LABEL[lv]}</span>
              <p className="lp-muted">{LEVEL_BLURB[lv]}</p>
              <div className="lp-bar" aria-hidden="true"><i style={{ width: `${total ? (d / total) * 100 : 0}%` }} /></div>
              <small>{d} / {total} concepts</small>
              <button className="lp-link" type="button" onClick={() => go("learn", { level: String(lv) })}>
                Study {LEVEL_LABEL[lv].toLowerCase()} concepts →
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <div className="lp-head"><div><span className="lp-eyebrow">KNOWLEDGE AREAS</span><h2>Where you stand</h2></div></div>
        <div className="lp-areas">
          {areas.map((a) => (
            <button key={a.id} type="button" className="lp-area" onClick={() => go("learn", { area: a.id })}>
              <strong>{a.name}</strong>
              <span className="lp-bar" aria-hidden="true"><i style={{ width: `${a.total ? (a.done / a.total) * 100 : 0}%` }} /></span>
              <small>{a.done} / {a.total}</small>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="lp-head"><div><span className="lp-eyebrow">TEST YOURSELF</span><h2>Turn knowledge into answers</h2></div></div>
        <div className="lp-tiles">
          <button type="button" className="lp-tile" onClick={() => go("interview", { sub: "bank" })}>
            <strong>Question bank</strong><span>{known} / {data.questions.length} marked known</span>
          </button>
          {data.drills && (
            <button type="button" className="lp-tile" onClick={() => go("practice", { sub: "drills" })}>
              <strong>Production drills</strong><span>{solved} / {data.drills.length} diagnosed</span>
            </button>
          )}
          {data.codeLab && (
            <button type="button" className="lp-tile" onClick={() => go("practice", { sub: "code" })}>
              <strong>Code lab</strong><span>{data.codeLab.length} utilities to write from memory</span>
            </button>
          )}
          <button type="button" className="lp-tile" onClick={() => go("interview", { sub: "cheat" })}>
            <strong>Night-before cheat sheet</strong><span>{data.interview.glance.length} one-line recalls</span>
          </button>
        </div>
      </section>
    </div>
  );
}
