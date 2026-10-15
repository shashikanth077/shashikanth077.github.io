import { useMemo } from "react";
import type { LearnCtx } from "../ctx.js";
import { countDone } from "../progress.js";
import { CodeBlock, Rich, plain } from "../Rich.js";
import { LEVEL_LABEL, type Level } from "../types.js";
import type { Visual } from "../visuals/types.js";
import { VisualView } from "../visuals/VisualView.js";

export function Learn({ ctx }: { ctx: LearnCtx }) {
  const { data, progress, toggle, params, setParam, visuals, stack } = ctx;
  const labels = stack.labels ?? {};
  const area = params.get("area") ?? "all";
  const level = Number(params.get("level") ?? 0) as 0 | Level;
  const open = params.get("open");
  const text = params.get("q") ?? "";

  const list = useMemo(() => {
    const term = text.trim().toLowerCase();
    return data.concepts.filter(
      (c) =>
        (area === "all" || c.area === area) &&
        (!level || c.level === level) &&
        (!term || `${c.title} ${plain(c.summary)} ${plain(c.production)} ${plain(c.interview)}`.toLowerCase().includes(term)),
    );
  }, [data, area, level, text]);

  const areaName = data.areas.find((a) => a.id === area)?.name ?? "All areas";

  return (
    <div className="lp-split">
      <nav className="lp-rail" aria-label="Knowledge areas">
        <button type="button" className={area === "all" ? "is-on" : ""} onClick={() => setParam("area", null)}>
          <span>All areas</span>
          <small>{countDone(progress.studied, data.concepts.map((c) => c.id))}/{data.concepts.length}</small>
        </button>
        {data.areas.map((a) => {
          const ids = data.concepts.filter((c) => c.area === a.id).map((c) => c.id);
          return (
            <button key={a.id} type="button" className={area === a.id ? "is-on" : ""} onClick={() => setParam("area", a.id)}>
              <span>{a.name}</span>
              <small>{countDone(progress.studied, ids)}/{ids.length}</small>
            </button>
          );
        })}
      </nav>

      <div className="lp-main">
        <div className="lp-toolbar">
          <label className="lp-field lp-field--grow">
            <span className="lp-sr">Search concepts</span>
            <input type="search" placeholder="Search concepts in this stack" value={text} onChange={(e) => setParam("q", e.target.value || null)} />
          </label>
          <select className="lp-select lp-rail-select" aria-label="Area" value={area} onChange={(e) => setParam("area", e.target.value === "all" ? null : e.target.value)}>
            <option value="all">All areas</option>
            {data.areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <div className="lp-chips" role="group" aria-label="Level">
            {([0, 1, 2, 3] as const).map((lv) => (
              <button key={lv} type="button" aria-pressed={level === lv} onClick={() => setParam("level", lv ? String(lv) : null)}>
                {lv ? LEVEL_LABEL[lv] : "All levels"}
              </button>
            ))}
          </div>
        </div>

        <p className="lp-count" aria-live="polite">{areaName} · {list.length} {list.length === 1 ? "concept" : "concepts"}</p>

        {list.length === 0 && <div className="lp-empty">No concepts match. Clear the search or choose another level.</div>}

        <div className="lp-concepts">
          {list.map((c) => {
            const isOpen = open === c.id;
            const studied = !!progress.studied[c.id];
            return (
              <article key={c.id} className={`lp-concept${isOpen ? " is-open" : ""}${studied ? " is-done" : ""}`} id={`c-${c.id}`}>
                <header>
                  <button type="button" className="lp-concept__head" aria-expanded={isOpen} onClick={() => setParam("open", isOpen ? null : c.id)}>
                    <span className={`lp-level lp-level--${c.level}`}>{LEVEL_LABEL[c.level]}</span>
                    <strong>{c.title}</strong>
                    <span className="lp-concept__chev" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                  </button>
                  <label className="lp-check" title="Mark as studied">
                    <input type="checkbox" checked={studied} onChange={() => toggle("studied", c.id)} />
                    <span className="lp-sr">Mark “{c.title}” as studied</span>
                  </label>
                </header>
                {isOpen && (
                  <div className="lp-concept__body">
                    {visuals[c.id] && <VisualView visual={visuals[c.id] as Visual} key={c.id} />}
                    <p className="lp-concept__summary"><Rich text={c.summary} /></p>
                    {c.code && <CodeBlock code={c.code} output={c.output} />}
                    <div className="lp-twin">
                      <section className="lp-callout lp-callout--prod"><h4>{labels.production ?? "In production"}</h4><p><Rich text={c.production} /></p></section>
                      <section className="lp-callout lp-callout--int"><h4>{labels.interview ?? "How interviewers probe it"}</h4><p><Rich text={c.interview} /></p></section>
                    </div>
                    <button type="button" className={`lp-btn${studied ? "" : " lp-btn--primary"}`} onClick={() => toggle("studied", c.id)}>
                      {studied ? "✓ Studied — undo" : "Mark as studied"}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
