import { useEffect } from "react";
import { Link } from "react-router-dom";
import { AI_STAGES, stackPath, stacks } from "../learn/catalog.js";

const aiStacks = stacks.filter((s) => s.section === "ai");

const PROMISES = [
  { icon: "🎞", title: "Pictures first", text: "Every concept opens with an animated diagram you can play, pause and step through — before any theory." },
  { icon: "🔍", title: "See the code run", text: "Line-by-line execution traces show variables changing in memory, exactly as Python sees them." },
  { icon: "🎯", title: "Interview ready", text: "Predict-the-output drills, a question bank, mock interviews and a one-page cheat sheet for every track." },
];

export default function AiAtlas() {
  useEffect(() => {
    document.title = "AI Atlas — Learn AI Visually, from Python to Agents | ToolNest";
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute(
      "content",
      "A visual learning path for AI: Python, maths, machine learning, neural networks, deep learning, generative AI and agentic AI — animated diagrams, code traces and interview prep.",
    );
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", "https://shashikant-hr.me/tools/ai");
  }, []);

  const liveCount = aiStacks.filter((s) => s.load).length;

  return (
    <div className="lp lp-ai">
      <div className="lp-crumb"><Link to="/">Tools</Link><span>/</span>AI Atlas</div>

      <section className="lp-hero lp-hero--ai">
        <span className="lp-eyebrow">TOOLNEST / AI ATLAS</span>
        <h1>Learn AI by seeing it.<br /><em>From Python to agents.</em></h1>
        <p>A map of everything you need for modern AI, built one track at a time. Each track is diagram-first, with animated explanations, runnable thinking and interview practice.</p>
        <ol className="lp-hero__steps">
          <li><b>1</b> Pick a track</li>
          <li><b>2</b> Watch it move</li>
          <li><b>3</b> Practise and prove it</li>
        </ol>
      </section>

      <section>
        <div className="lp-head"><div><span className="lp-eyebrow">WHY IT WORKS</span><h2>Built for understanding, not memorising</h2></div></div>
        <div className="lp-tiles">
          {PROMISES.map((p) => (
            <div key={p.title} className="lp-card lp-promise">
              <span aria-hidden="true">{p.icon}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="lp-head">
          <div><span className="lp-eyebrow">THE ROADMAP</span><h2>Your path through AI</h2></div>
          <p className="lp-muted lp-note">{liveCount} track{liveCount === 1 ? "" : "s"} live. The rest are being written — start at the beginning and the order stays valid.</p>
        </div>

        <ol className="lp-road">
          {AI_STAGES.map((stage, i) => {
            const tracks = aiStacks.filter((s) => s.stage === stage);
            return (
              <li key={stage} className="lp-road__stage">
                <div className="lp-road__mark" aria-hidden="true"><b>{i + 1}</b></div>
                <div className="lp-road__body">
                  <h3>{stage}</h3>
                  <div className="lp-road__tracks">
                    {tracks.map((s) =>
                      s.load ? (
                        <Link key={s.slug} to={stackPath(s)} className="lp-track is-live" style={{ ["--lp-accent" as string]: s.accent }}>
                          <span className="lp-track__icon" aria-hidden="true">{s.icon}</span>
                          <div>
                            <h4>{s.name} <span className="lp-badge">live</span></h4>
                            <p>{s.blurb}</p>
                            {s.stats && (
                              <ul className="lp-track__stats">
                                <li><b>{s.stats.concepts}</b> concepts</li>
                                <li><b>{s.stats.questions}</b> questions</li>
                                <li><b>{s.stats.drills}</b> {(s.labels?.drillsTab ?? "drills").toLowerCase()}</li>
                                <li><b>{s.stats.codeLab}</b> {(s.labels?.codeTab ?? "exercises").toLowerCase()}</li>
                              </ul>
                            )}
                            <span className="lp-track__cta">Start learning →</span>
                          </div>
                        </Link>
                      ) : (
                        <div key={s.slug} className="lp-track is-soon" style={{ ["--lp-accent" as string]: s.accent }}>
                          <span className="lp-track__icon" aria-hidden="true">{s.icon}</span>
                          <div>
                            <h4>{s.name} <span className="lp-badge lp-badge--quiet">soon</span></h4>
                            <p>{s.tagline}</p>
                            {s.planned && <ul className="lp-track__plan">{s.planned.map((p) => <li key={p}>{p}</li>)}</ul>}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <p className="lp-muted lp-note">Progress is saved in this browser only. Nothing is uploaded — same promise as every other ToolNest tool.</p>
    </div>
  );
}
