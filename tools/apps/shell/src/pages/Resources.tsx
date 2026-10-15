import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { guides } from "./resource-guides.js";

const categories = ["All skills", "Frontend", "Backend", "Data", "Cloud", "Foundations"] as const;

export default function Resources() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All skills");
  const selected = guides.find((guide) => guide.slug === params.get("guide"));
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return guides.filter((guide) =>
      (category === "All skills" || guide.category === category) &&
      (!term || `${guide.title} ${guide.summary} ${guide.category} ${guide.topics.map((topic) => topic.title).join(" ")}`.toLowerCase().includes(term)),
    );
  }, [query, category]);

  useEffect(() => {
    document.title = selected ? `${selected.title} | ToolNest Resources` : "Resource pool | ToolNest";
    const description = selected?.summary ?? "Practical technology learning guides and interview questions for developers.";
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", "https://shashikant-hr.me/tools/resources");
  }, [selected]);

  function chooseGuide(slug: string | null) {
    setParams(slug ? { guide: slug } : {});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="resources">
      <div className="resources__crumb"><Link to="/">Tools</Link><span>/</span> Resource pool</div>
      {selected ? (
        <>
          <button className="resources__back" type="button" onClick={() => chooseGuide(null)}>← All guides</button>
          <section className="resources__hero resources__hero--guide">
            <span className="resources__eyebrow">SKILL GUIDE / {selected.category.toUpperCase()}</span>
            <h1>{selected.title}</h1>
            <p>{selected.summary}</p>
            <div className="resources__heroMeta"><span>{selected.level}</span><span>{selected.topics.length} learning steps</span><span>{selected.questions.length} interview questions</span></div>
          </section>
          <div className="resources__detailGrid">
            <section className="resources__panel">
              <span className="resources__eyebrow">LEARNING PATH</span>
              <h2>What to learn</h2>
              <ol className="resources__steps">
                {selected.topics.map((topic) => <li key={topic.title}><strong>{topic.title}</strong><p>{topic.detail}</p></li>)}
              </ol>
            </section>
            <aside className="resources__panel resources__panel--aside">
              <span className="resources__eyebrow">YOUR GOAL</span>
              <h2>After this guide</h2>
              <p>{selected.outcome}</p>
              <a href="#interview" className="resources__textLink">Practice interview questions →</a>
            </aside>
          </div>
          <section className="resources__panel" id="interview">
            <span className="resources__eyebrow">INTERVIEW PREP</span>
            <h2>Questions to practice</h2>
            <div className="resources__qa">
              {selected.questions.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="resources__hero">
            <span className="resources__eyebrow">TOOLNEST / RESOURCE POOL</span>
            <h1>Learn a skill.<br /><em>Walk into the interview ready.</em></h1>
            <p>Focused guides for building your knowledge, reviewing key concepts, and practicing the questions that matter.</p>
            <div className="resources__heroMeta"><span>{guides.length} starter guides</span><span>Learning paths</span><span>Interview practice</span></div>
          </section>
          <div className="resources__sectionHead"><div><span className="resources__eyebrow">EXPLORE THE LIBRARY</span><h2>Choose your next skill</h2></div><p>Start with a topic. Follow the learning path, then test yourself.</p></div>
          <div className="resources__controls">
            <label className="resources__search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search skills or topics" aria-label="Search resource guides" /></label>
            <div className="resources__filters" aria-label="Filter guides by category">{categories.map((item) => <button key={item} type="button" className={category === item ? "is-active" : ""} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>)}</div>
          </div>
          <p className="resources__count" aria-live="polite">Showing {filtered.length} {filtered.length === 1 ? "guide" : "guides"}</p>
          {filtered.length ? <div className="resources__grid">{filtered.map((guide) => <button className="resources__card" type="button" key={guide.slug} onClick={() => chooseGuide(guide.slug)}><span className="resources__cardTop"><span className="resources__cardIcon" aria-hidden="true">{guide.icon}</span><span className="resources__cardArrow" aria-hidden="true">↗</span></span><span className="resources__cardTags"><span>{guide.category}</span><span>{guide.level}</span></span><strong>{guide.title}</strong><span className="resources__cardSummary">{guide.summary}</span><span className="resources__cardFoot">{guide.topics.length} learning steps <span>·</span> {guide.questions.length} questions</span></button>)}</div> : <div className="resources__empty">No guides match your search. Try another skill or category.</div>}
        </>
      )}
    </div>
  );
}
