import { useMemo, useState } from "react";
import type { LearnCtx } from "../ctx.js";
import { countDone } from "../progress.js";
import { Rich, plain } from "../Rich.js";
import { SubTabs } from "../SubTabs.js";
import { LEVEL_LABEL, type Level, type Question } from "../types.js";

function QuestionBank({ ctx }: { ctx: LearnCtx }) {
  const { data, progress, toggle, params, setParam } = ctx;
  const area = params.get("area") ?? "all";
  const level = Number(params.get("level") ?? 0) as 0 | Level;
  const text = params.get("q") ?? "";
  const hideKnown = params.get("unknown") === "1";
  const [open, setOpen] = useState<string | null>(null);

  const list = useMemo(() => {
    const term = text.trim().toLowerCase();
    return data.questions.filter(
      (q) =>
        (area === "all" || q.area === area) &&
        (!level || q.level === level) &&
        !(hideKnown && progress.known[q.id]) &&
        (!term || `${q.q} ${plain(q.a)}`.toLowerCase().includes(term)),
    );
  }, [data, area, level, text, hideKnown, progress.known]);

  const known = countDone(progress.known, data.questions.map((q) => q.id));

  return (
    <div className="lp-stack">
      <div className="lp-toolbar">
        <label className="lp-field lp-field--grow">
          <span className="lp-sr">Search questions</span>
          <input type="search" placeholder="Search questions" value={text} onChange={(e) => setParam("q", e.target.value || null)} />
        </label>
        <select className="lp-select" aria-label="Area" value={area} onChange={(e) => setParam("area", e.target.value === "all" ? null : e.target.value)}>
          <option value="all">All areas</option>
          {data.areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select className="lp-select" aria-label="Level" value={level} onChange={(e) => setParam("level", e.target.value === "0" ? null : e.target.value)}>
          <option value={0}>All levels</option>
          {([1, 2, 3] as Level[]).map((lv) => <option key={lv} value={lv}>{LEVEL_LABEL[lv]}</option>)}
        </select>
        <label className="lp-inline"><input type="checkbox" checked={hideKnown} onChange={(e) => setParam("unknown", e.target.checked ? "1" : null)} /> Hide ones I know</label>
      </div>
      <p className="lp-count" aria-live="polite">{list.length} questions · {known} / {data.questions.length} marked known</p>
      {list.length === 0 && <div className="lp-empty">No questions match these filters.</div>}
      <div className="lp-qa">
        {list.map((q) => {
          const isOpen = open === q.id;
          return (
            <article key={q.id} className={isOpen ? "is-open" : ""}>
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : q.id)}>
                <span className={`lp-level lp-level--${q.level}`}>{LEVEL_LABEL[q.level]}</span>
                <strong>{q.q}</strong>
                {progress.known[q.id] && <span className="lp-badge">known</span>}
              </button>
              {isOpen && (
                <div className="lp-qa__answer">
                  <p><Rich text={q.a} /></p>
                  <label className="lp-inline"><input type="checkbox" checked={!!progress.known[q.id]} onChange={() => toggle("known", q.id)} /> I can answer this confidently</label>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

const MOCK_SIZE = 10;

function pickRandom(list: Question[], n: number) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as Question, copy[i] as Question];
  }
  return copy.slice(0, n);
}

function Mock({ ctx }: { ctx: LearnCtx }) {
  const { data, toggle } = ctx;
  const [deck, setDeck] = useState<Question[] | null>(null);
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState<boolean[]>([]);

  function start() {
    setDeck(pickRandom(data.questions, MOCK_SIZE));
    setI(0);
    setRevealed(false);
    setScore([]);
  }

  function rate(good: boolean) {
    if (!deck) return;
    const q = deck[i];
    if (q && good) toggle("known", q.id, true);
    setScore([...score, good]);
    setRevealed(false);
    setI(i + 1);
  }

  if (!deck) {
    return (
      <div className="lp-card lp-mock">
        <h3>Mock interview</h3>
        <p className="lp-muted">{MOCK_SIZE} random questions. Answer each one out loud before revealing the model answer, then rate yourself honestly. Questions you nail are marked as known.</p>
        <button type="button" className="lp-btn lp-btn--primary" onClick={start}>Start mock interview</button>
      </div>
    );
  }

  if (i >= deck.length) {
    const good = score.filter(Boolean).length;
    return (
      <div className="lp-card lp-mock">
        <h3>You nailed {good} of {deck.length}</h3>
        <p className="lp-muted">{good === deck.length ? "Excellent. Try the advanced level in the question bank." : "Review the ones you missed in the question bank, then run another round."}</p>
        <ul className="lp-review">
          {deck.map((q, n) => <li key={q.id} className={score[n] ? "ok" : "miss"}><span aria-hidden="true">{score[n] ? "✓" : "✕"}</span> {q.q}</li>)}
        </ul>
        <button type="button" className="lp-btn lp-btn--primary" onClick={start}>New round</button>
      </div>
    );
  }

  const q = deck[i] as Question;
  return (
    <div className="lp-card lp-mock">
      <div className="lp-mock__top"><span>Question {i + 1} of {deck.length}</span><span className={`lp-level lp-level--${q.level}`}>{LEVEL_LABEL[q.level]}</span></div>
      <div className="lp-bar" aria-hidden="true"><i style={{ width: `${(i / deck.length) * 100}%` }} /></div>
      <h3 className="lp-mock__q">{q.q}</h3>
      {revealed ? (
        <>
          <div className="lp-callout lp-callout--prod"><h4>Model answer</h4><p><Rich text={q.a} /></p></div>
          <div className="lp-actions">
            <button type="button" className="lp-btn lp-btn--primary" onClick={() => rate(true)}>I got it</button>
            <button type="button" className="lp-btn" onClick={() => rate(false)}>I missed it</button>
          </div>
        </>
      ) : (
        <button type="button" className="lp-btn" onClick={() => setRevealed(true)}>Reveal model answer</button>
      )}
    </div>
  );
}

function Playbook({ ctx }: { ctx: LearnCtx }) {
  const { interview } = ctx.data;
  const [stage, setStage] = useState(0);
  const s = interview.stages[stage];
  return (
    <div className="lp-stack">
      {interview.stages.length > 0 && (
        <section>
          <h3 className="lp-sub">Interview stages</h3>
          <div className="lp-stages" role="group" aria-label="Interview stages">
            {interview.stages.map((st, n) => (
              <button key={st.name} type="button" aria-pressed={stage === n} onClick={() => setStage(n)}><b>{n + 1}</b> {st.name}</button>
            ))}
          </div>
          {s && (
            <div className="lp-twin lp-card" aria-live="polite">
              <div><h4>What they check</h4><ul>{s.checks.map((c) => <li key={c}>{c}</li>)}</ul></div>
              <div><h4>How to prepare</h4><ul>{s.prep.map((c) => <li key={c}>{c}</li>)}</ul></div>
            </div>
          )}
        </section>
      )}

      {interview.seniority.length > 0 && (
        <section>
          <h3 className="lp-sub">How the bar changes with seniority</h3>
          <div className="lp-table">
            <table>
              <thead><tr><th>Area</th><th>Mid-level</th><th>Senior</th><th>Staff / principal</th></tr></thead>
              <tbody>{interview.seniority.map((r) => <tr key={r.area}><th scope="row">{r.area}</th><td>{r.mid}</td><td>{r.senior}</td><td>{r.staff}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      )}

      {interview.frameworks.length > 0 && (
        <section>
          <h3 className="lp-sub">Answer frameworks</h3>
          <div className="lp-tiles">
            {interview.frameworks.map((f) => (
              <div key={f.name} className="lp-card"><strong>{f.name}</strong><ol>{f.steps.map((st) => <li key={st}>{st}</li>)}</ol></div>
            ))}
          </div>
        </section>
      )}

      {interview.stories.length > 0 && (
        <section>
          <h3 className="lp-sub">Behavioral stories with model answers</h3>
          <p className="lp-muted">Numbers are illustrative — replace them with your own; specifics make a story believable.</p>
          {interview.stories.map((st) => (
            <details key={st.title} className="lp-card lp-story">
              <summary>{st.title}</summary>
              {st.parts.map((p) => {
                const [label, ...rest] = p.split(": ");
                return <p key={p}><b>{rest.length ? label : ""}</b>{rest.length ? ` ${rest.join(": ")}` : p}</p>;
              })}
            </details>
          ))}
        </section>
      )}
    </div>
  );
}

function Cheat({ ctx }: { ctx: LearnCtx }) {
  const { interview } = ctx.data;
  return (
    <div className="lp-stack">
      <div className="lp-actions lp-noprint">
        <p className="lp-muted lp-grow">Read this the night before. Each tile is a sentence you should be able to expand for two minutes.</p>
        <button type="button" className="lp-btn" onClick={() => window.print()}>Print or save as PDF</button>
      </div>
      <div className="lp-glance">
        {interview.glance.map((g) => <div key={g.title} className="lp-card"><strong>{g.title}</strong><p>{g.text}</p></div>)}
      </div>
      <div className="lp-twin">
        {interview.lists.map((l) => (
          <section key={l.title} className="lp-card"><h4>{l.title}</h4><ul>{l.items.map((it) => <li key={it}>{it}</li>)}</ul></section>
        ))}
      </div>
    </div>
  );
}

export function Interview({ ctx }: { ctx: LearnCtx }) {
  const { params, setParam, data } = ctx;
  const iv = data.interview;
  const hasPlaybook = iv.stages.length + iv.seniority.length + iv.frameworks.length + iv.stories.length > 0;
  const tabs = [
    { id: "bank", label: "Question bank" },
    { id: "mock", label: "Mock interview" },
    ...(hasPlaybook ? [{ id: "playbook", label: "Playbook" }] : []),
    { id: "cheat", label: "Cheat sheet" },
  ];
  const sub = tabs.find((t) => t.id === params.get("sub"))?.id ?? "bank";
  return (
    <div className="lp-stack">
      <SubTabs tabs={tabs} value={sub} onChange={(v) => setParam("sub", v)} />
      {sub === "bank" && <QuestionBank ctx={ctx} />}
      {sub === "mock" && <Mock ctx={ctx} />}
      {sub === "playbook" && <Playbook ctx={ctx} />}
      {sub === "cheat" && <Cheat ctx={ctx} />}
    </div>
  );
}
