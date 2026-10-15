import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { STACK_CATEGORIES, stackPath, stacks, type StackCategory } from "../learn/catalog.js";

const devStacks = stacks.filter((s) => s.section === "dev");

export default function Resources() {
  useEffect(() => {
    document.title = "Learning Portal — Concepts & Interview Prep by Tech Stack | ToolNest";
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute(
      "content",
      "Pick a tech stack and learn it properly: concept library with production and interview angles, drills, code labs, question bank and mock interviews.",
    );
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", "https://shashikant-hr.me/tools/resources");
  }, []);

  const [text, setText] = useState("");
  const [category, setCategory] = useState<StackCategory | "All">("All");
  const matches = useMemo(() => {
    const term = text.trim().toLowerCase();
    return devStacks.filter(
      (s) => (category === "All" || s.category === category) && (!term || `${s.name} ${s.tagline} ${s.blurb} ${s.category}`.toLowerCase().includes(term)),
    );
  }, [text, category]);
  const live = matches.filter((s) => s.load);
  const soon = matches.filter((s) => !s.load);

  return (
    <div className="lp">
      <div className="lp-crumb"><Link to="/">Tools</Link><span>/</span>Learning portal</div>

      <section className="lp-hero">
        <span className="lp-eyebrow">TOOLNEST / LEARNING PORTAL</span>
        <h1>Pick a stack.<br /><em>Learn it, then prove it.</em></h1>
        <p>Every stack has the same path: a concept library that explains the idea, shows it in production and shows how interviewers probe it — then drills, code labs and a full interview kit.</p>
        <ol className="lp-hero__steps">
          <li><b>1</b> Learn concepts</li>
          <li><b>2</b> Practice with drills</li>
          <li><b>3</b> Prepare for interviews</li>
        </ol>
      </section>

      <section>
        <div className="lp-head"><div><span className="lp-eyebrow">AVAILABLE NOW</span><h2>Choose your tech stack</h2></div></div>
        <div className="lp-toolbar lp-gap-bottom">
          <label className="lp-field lp-field--grow">
            <span className="lp-sr">Search tech stacks</span>
            <input type="search" placeholder="Search stacks, e.g. cache, hooks, SQL" value={text} onChange={(e) => setText(e.target.value)} />
          </label>
          <div className="lp-chips" role="group" aria-label="Category">
            {(["All", ...STACK_CATEGORIES] as const).map((c) => (
              <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
        </div>
        {matches.length === 0 && <div className="lp-empty">No stacks match. Try another word or category.</div>}
        <div className="lp-stacks">
          {live.map((s) => (
            <Link key={s.slug} to={stackPath(s)} className="lp-stackcard" style={{ ["--lp-accent" as string]: s.accent }}>
              <span className="lp-stackcard__icon" aria-hidden="true">{s.icon}</span>
              <h3>{s.name} <span className="lp-badge lp-badge--quiet">{s.category}</span></h3>
              <p className="lp-stackcard__tag">{s.tagline}</p>
              <p>{s.blurb}</p>
              {s.stats && (
                <ul className="lp-stackcard__stats">
                  <li><b>{s.stats.concepts}</b> concepts</li>
                  <li><b>{s.stats.questions}</b> questions</li>
                  <li><b>{s.stats.drills}</b> drills</li>
                  <li><b>{s.stats.codeLab}</b> code labs</li>
                  {!!s.stats.patterns && <li><b>{s.stats.patterns}</b> patterns</li>}
                </ul>
              )}
              <small>{s.audience}</small>
              <span className="lp-stackcard__cta">Open learning portal →</span>
            </Link>
          ))}
        </div>
      </section>

      {soon.length > 0 && (
        <section>
          <div className="lp-head"><div><span className="lp-eyebrow">ON THE WAY</span><h2>Coming soon</h2></div></div>
          <div className="lp-stacks lp-stacks--soon">
            {soon.map((s) => (
              <div key={s.slug} className="lp-stackcard is-soon" style={{ ["--lp-accent" as string]: s.accent }}>
                <span className="lp-stackcard__icon" aria-hidden="true">{s.icon}</span>
                <h3>{s.name} <span className="lp-badge">soon</span></h3>
                <p>{s.blurb}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="lp-muted lp-note">Your progress is saved in this browser only. Nothing is uploaded — same promise as every other ToolNest tool.</p>
    </div>
  );
}
