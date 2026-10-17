import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AI_STAGES, stackPath, stacks, type Stack } from "../learn/catalog.js";

const aiStacks = stacks.filter((s) => s.section === "ai");
const bySlug = (slug: string) => aiStacks.find((s) => s.slug === slug);

/** Guided starting points: ordered tracks for a goal. */
const PATHS = [
  { id: "start", icon: "🌱", title: "I'm new to AI", text: "Python, the maths you need, then NumPy and pandas.", slugs: ["python-ai", "maths-ai", "numpy", "pandas"] },
  { id: "ml", icon: "📈", title: "Machine learning & deep learning", text: "From statistics and classifiers to neural networks.", slugs: ["machine-learning", "scikit-learn", "neural-networks", "computer-vision"] },
  { id: "llm", icon: "✨", title: "Build with LLMs", text: "Transformers, RAG, agents and the tools to ship them.", slugs: ["generative-ai", "langchain-langgraph-rag", "agentic-ai", "building-with-claude"] },
  { id: "modal", icon: "🎙", title: "Language, speech & decisions", text: "NLP, speech processing and reinforcement learning.", slugs: ["nlp", "speech-processing", "reinforcement-learning"] },
];

const PROMISES = [
  { icon: "🎞", title: "Pictures first", text: "Every concept opens with an animated diagram you can play, pause and step through — before any theory." },
  { icon: "▶", title: "Code that really ran", text: "Every output panel comes from running the example, not from typing what we expect." },
  { icon: "🎯", title: "Interview ready", text: "Work-it-out drills, a question bank and a cheat sheet in every track." },
  { icon: "🔒", title: "Private by design", text: "Progress lives in your browser only. Nothing is uploaded, nothing needs an account." },
];

/** `slug` marks a scenario that is already live (its track opens from the card). */
const PROJECTS: { icon: string; title: string; text: string; tags: string[]; slug?: string }[] = [
  { icon: "🛡", title: "Real-time fraud detection", text: "Streaming features, a scoring model and a 100 ms decision budget — with a live lab.", tags: ["streaming", "ML", "latency"], slug: "fraud-detection" },
  { icon: "💬", title: "Support assistant with RAG", text: "Grounded answers with citations, evaluation and human hand-off.", tags: ["RAG", "LLM", "evaluation"] },
  { icon: "🏭", title: "Predictive maintenance", text: "Sensor streams, anomaly detection and alerts engineers trust.", tags: ["time series", "alerts"] },
  { icon: "🛒", title: "Live recommendations", text: "Ranking, cold start and the feedback loop in production.", tags: ["ranking", "feedback"] },
  { icon: "📄", title: "Document intelligence", text: "OCR, extraction and validation for invoices and forms.", tags: ["vision", "NLP"] },
  { icon: "🗣", title: "Voice assistant", text: "Streaming speech-to-text, an LLM and text-to-speech, end to end.", tags: ["speech", "latency"] },
  { icon: "🔍", title: "Visual quality inspection", text: "Defect detection on a production line, on the edge.", tags: ["vision", "edge"] },
  { icon: "🤖", title: "Agentic IT-ops copilot", text: "Tools, approvals, audit logs and safe automation.", tags: ["agents", "safety"] },
];

const STUDIED_KEY = (slug: string) => `toolnest-learn:${slug}`;

/** Studied-concept count for a track from this browser's saved progress (never throws). */
function studied(slug: string): number {
  try {
    const raw = localStorage.getItem(STUDIED_KEY(slug));
    return raw ? Object.keys((JSON.parse(raw) as { studied?: Record<string, true> }).studied ?? {}).length : 0;
  } catch {
    return 0;
  }
}

type Filter = "all" | "live" | "soon" | (typeof AI_STAGES)[number];

function Card({ s, index }: { s: Stack; index: number }) {
  const live = !!s.load;
  const done = live && s.stats ? studied(s.slug) : 0;
  const pct = live && s.stats && s.stats.concepts ? Math.min(100, Math.round((done / s.stats.concepts) * 100)) : 0;
  const body = (
    <>
      <div className="ai-card__top">
        <span className="ai-card__icon" aria-hidden="true">{s.icon}</span>
        <span className="ai-card__no">{String(index + 1).padStart(2, "0")}</span>
        <span className={`lp-badge ${live ? "" : "lp-badge--quiet"}`}>{live ? "live" : "coming soon"}</span>
      </div>
      <span className="ai-card__stage">{s.stage}</span>
      <h3>{s.name}</h3>
      <p>{live ? s.tagline : s.blurb}</p>
      {live && s.stats ? (
        <>
          <ul className="ai-card__stats">
            <li><b>{s.stats.concepts}</b> concepts</li>
            <li><b>{s.stats.drills}</b> drills</li>
            <li><b>{s.stats.codeLab}</b> labs</li>
          </ul>
          {done > 0 ? (
            <div className="ai-card__progress" title={`${done} of ${s.stats.concepts} concepts studied`}>
              <span className="lp-bar"><i style={{ width: `${pct}%` }} /></span>
              <small>{pct}% studied</small>
            </div>
          ) : (
            <span className="ai-card__cta">Start learning →</span>
          )}
        </>
      ) : (
        s.planned && <ul className="lp-track__plan">{s.planned.map((p) => <li key={p}>{p}</li>)}</ul>
      )}
    </>
  );
  const style = { ["--lp-accent" as string]: s.accent };
  return live ? (
    <Link to={stackPath(s)} className="ai-card is-live" style={style}>{body}</Link>
  ) : (
    <div className="ai-card is-soon" style={style}>{body}</div>
  );
}

export default function AiAtlas() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    document.title = "AI Atlas — Learn AI Visually, from Python to Agents | ToolNest";
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute(
      "content",
      "A visual learning path for AI: Python, maths, machine learning, neural networks, NLP, computer vision, speech, reinforcement learning, generative AI, agents, LangChain and Claude — animated diagrams, real code output and interview prep.",
    );
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", "https://shashikant-hr.me/tools/ai");
  }, []);

  const live = aiStacks.filter((s) => s.load);
  const totals = useMemo(() => {
    const sum = (k: "concepts" | "questions" | "drills" | "codeLab") => live.reduce((n, s) => n + (s.stats?.[k] ?? 0), 0);
    return { tracks: live.length, concepts: sum("concepts"), questions: sum("questions"), labs: sum("drills") + sum("codeLab") };
  }, [live]);

  const continueTrack = useMemo(() => {
    const started = live.map((s) => ({ s, n: studied(s.slug) })).filter((x) => x.n > 0 && x.s.stats && x.n < x.s.stats.concepts);
    return started.sort((a, b) => b.n - a.n)[0]?.s;
  }, [live]);

  const q = query.trim().toLowerCase();
  const visible = aiStacks
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => {
      if (filter === "live" && !s.load) return false;
      if (filter === "soon" && s.load) return false;
      if (filter !== "all" && filter !== "live" && filter !== "soon" && s.stage !== filter) return false;
      if (!q) return true;
      // match at word starts so "rag" finds RAG, not "storage"
      return `${s.name} ${s.tagline} ${s.blurb} ${(s.planned ?? []).join(" ")}`
        .toLowerCase()
        .split(/[^a-z0-9+#.]+/)
        .some((w) => w.startsWith(q)) || `${s.name} ${s.tagline}`.toLowerCase().includes(q);
    });

  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="lp lp-ai ai">
      <section className="ai-hero" aria-labelledby="ai-title">
        <span className="ai-orb ai-orb--a" aria-hidden="true" />
        <span className="ai-orb ai-orb--b" aria-hidden="true" />
        <div className="ai-hero__copy">
          <span className="ai-hero__eyebrow">TOOLNEST · AI ATLAS</span>
          <h1 id="ai-title">Learn AI by <em>seeing</em> it.<br />From Python to agents.</h1>
          <p>{totals.tracks} diagram-first tracks covering everything from NumPy to LangGraph. Every idea moves, every number is computed by code that really ran, every track ends with interview practice.</p>
          <div className="ai-hero__cta">
            <button type="button" className="ai-btn ai-btn--primary" onClick={() => jump("ai-paths")}>Choose your path</button>
            <button type="button" className="ai-btn" onClick={() => jump("ai-tracks")}>Browse all tracks</button>
            {continueTrack && <Link to={stackPath(continueTrack)} className="ai-btn ai-btn--ghost">Continue: {continueTrack.name} →</Link>}
          </div>
        </div>
        <ul className="ai-hero__stats" aria-label="What is inside">
          <li><b>{totals.tracks}</b><span>live tracks</span></li>
          <li><b>{totals.concepts}</b><span>animated concepts</span></li>
          <li><b>{totals.questions}</b><span>interview questions</span></li>
          <li><b>{totals.labs}</b><span>drills & labs</span></li>
        </ul>
        <ul className="ai-hero__ring" aria-hidden="true">
          {live.slice(0, 12).map((s, i) => (
            <li key={s.slug} style={{ ["--i" as string]: i, ["--c" as string]: s.accent }}>{s.icon}</li>
          ))}
        </ul>
      </section>

      <section id="ai-paths" className="ai-section" aria-labelledby="ai-paths-title">
        <div className="lp-head"><div><span className="lp-eyebrow">START HERE</span><h2 id="ai-paths-title">Pick a path that fits your goal</h2></div><p className="lp-muted lp-note">Each path is an ordered shortlist — you can jump around any time.</p></div>
        <div className="ai-paths">
          {PATHS.map((p) => (
            <div key={p.id} className="ai-path">
              <span className="ai-path__icon" aria-hidden="true">{p.icon}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
              <ol>
                {p.slugs.map((slug) => {
                  const s = bySlug(slug);
                  return s ? <li key={slug}><Link to={stackPath(s)} style={{ ["--lp-accent" as string]: s.accent }}><i aria-hidden="true">{s.icon}</i>{s.name}</Link></li> : null;
                })}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section id="ai-tracks" className="ai-section" aria-labelledby="ai-tracks-title">
        <div className="lp-head"><div><span className="lp-eyebrow">THE ATLAS</span><h2 id="ai-tracks-title">{visible.length === aiStacks.length ? `All ${aiStacks.length} tracks` : `${visible.length} of ${aiStacks.length} tracks`}</h2></div></div>
        <div className="ai-toolbar">
          <label className="ai-search">
            <span className="lp-sr">Search tracks</span>
            <input type="search" placeholder="Search tracks and topics — try “RAG”, “LSTM”, “agents”…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <div className="ai-filters" role="group" aria-label="Filter tracks">
            {(["all", "live", "soon", ...AI_STAGES] as Filter[]).map((f) => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {f === "all" ? "All" : f === "live" ? "Live" : f === "soon" ? "Coming soon" : f}
              </button>
            ))}
          </div>
        </div>
        {visible.length ? (
          <div className="ai-grid">{visible.map(({ s, i }) => <Card key={s.slug} s={s} index={i} />)}</div>
        ) : (
          <p className="lp-muted ai-empty">No track matches “{query}”. Try a broader word such as “learning” or “language”.</p>
        )}
      </section>

      <section className="ai-projects" aria-labelledby="ai-projects-title">
        <div className="ai-projects__head">
          <span className="ai-soon">{PROJECTS.some((x) => x.slug && bySlug(x.slug)?.load) ? "FIRST SCENARIO LIVE · MORE COMING SOON" : "COMING SOON"}</span>
          <h2 id="ai-projects-title">Real-time AI project scenarios</h2>
          <p>Learn how the pieces fit in the real world. Each scenario walks through the requirements, the architecture, data and features, the model, evaluation, a latency and cost budget, deployment and monitoring — with a diagram you can step through and code that really runs.</p>
          <ol className="ai-projects__flow" aria-label="What every scenario covers">
            {["Problem", "Data", "Model", "Pipeline", "Serving", "Monitoring"].map((x) => <li key={x}>{x}</li>)}
          </ol>
        </div>
        <ul className="ai-projects__grid">
          {PROJECTS.map((p) => {
            const live = p.slug ? bySlug(p.slug) : undefined;
            const body = (
              <>
                <span aria-hidden="true">{p.icon}</span>
                <div>
                  <h3>{p.title}{live?.load && <em className="ai-project__live">live</em>}</h3>
                  <p>{p.text}</p>
                  <ul>{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
                  {live?.load && <b className="ai-project__go">Open the scenario →</b>}
                </div>
              </>
            );
            return (
              <li key={p.title} className={live?.load ? "is-live" : undefined}>
                {live?.load ? <Link to={stackPath(live)} className="ai-project">{body}</Link> : <div className="ai-project">{body}</div>}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="ai-section" aria-labelledby="ai-why-title">
        <div className="lp-head"><div><span className="lp-eyebrow">WHY IT WORKS</span><h2 id="ai-why-title">Built for understanding, not memorising</h2></div></div>
        <div className="ai-why">
          {PROMISES.map((p) => (
            <div key={p.title} className="ai-why__item">
              <span aria-hidden="true">{p.icon}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="lp-muted lp-note ai-foot">Progress is saved in this browser only. Nothing is uploaded — same promise as every other ToolNest tool.</p>
    </div>
  );
}
