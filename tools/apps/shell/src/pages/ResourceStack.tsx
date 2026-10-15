import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { findStack } from "../learn/catalog.js";
import type { LearnCtx, ViewId } from "../learn/ctx.js";
import { countDone, useProgress } from "../learn/progress.js";
import { plain } from "../learn/Rich.js";
import type { StackContent } from "../learn/types.js";
import { Interview } from "../learn/views/Interview.js";
import { Learn } from "../learn/views/Learn.js";
import { Patterns } from "../learn/views/Patterns.js";
import { Overview } from "../learn/views/Overview.js";
import { Practice } from "../learn/views/Practice.js";
import { Materials, Updates } from "../learn/views/Reference.js";
import NotFound from "./NotFound.js";

const VIEW_LABEL: Record<ViewId, string> = {
  overview: "Overview",
  learn: "Learn",
  patterns: "Patterns",
  practice: "Practice",
  interview: "Interview kit",
  updates: "What's new",
  materials: "Materials",
};

function GlobalSearch({ data, go }: { data: StackContent; go: LearnCtx["go"] }) {
  const [text, setText] = useState("");
  const results = useMemo(() => {
    const term = text.trim().toLowerCase();
    if (term.length < 2) return [];
    const concepts = data.concepts
      .filter((c) => `${c.title} ${plain(c.summary)}`.toLowerCase().includes(term))
      .slice(0, 5)
      .map((c) => ({ key: c.id, kind: "Concept", label: c.title, run: () => go("learn", { area: c.area, open: c.id }) }));
    const questions = data.questions
      .filter((q) => `${q.q} ${plain(q.a)}`.toLowerCase().includes(term))
      .slice(0, 5)
      .map((q) => ({ key: q.id, kind: "Question", label: q.q, run: () => go("interview", { sub: "bank", q: text.trim() }) }));
    return [...concepts, ...questions];
  }, [data, text, go]);

  return (
    <div className="lp-search">
      <label>
        <span className="lp-sr">Search concepts and questions</span>
        <input type="search" value={text} placeholder="Search concepts and questions…" onChange={(e) => setText(e.target.value)} />
      </label>
      {text.trim().length >= 2 && (
        <ul className="lp-search__results" aria-label="Search results">
          {results.length === 0 && <li className="lp-search__none">Nothing found for “{text}”.</li>}
          {results.map((r) => (
            <li key={`${r.kind}-${r.key}`}>
              <button type="button" onClick={() => { r.run(); setText(""); }}>
                <span>{r.kind}</span>{r.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ResourceStack() {
  const { stack: slug } = useParams();
  const stack = findStack(slug);
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<StackContent | null>(null);
  const [failed, setFailed] = useState(false);
  const { progress, toggle, reset } = useProgress(stack?.slug ?? "");

  useEffect(() => {
    setData(null);
    setFailed(false);
    stack?.load?.().then(setData).catch(() => setFailed(true));
  }, [stack]);

  useEffect(() => {
    if (!stack) return;
    const description = `${stack.name} learning portal: ${stack.blurb}`;
    document.title = `${stack.name} Learning Portal — Concepts & Interview Prep | ToolNest`;
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", `https://shashikant-hr.me/tools/resources/${stack.slug}`);
  }, [stack]);

  const available: ViewId[] = useMemo(
    () =>
      (["overview", "learn", ...(data?.patterns ? ["patterns"] : []), "practice", "interview", ...(data?.platform ? ["updates"] : []), "materials"] as ViewId[]).filter(
        (v) => v !== "practice" || !!(data?.drills || data?.codeLab || data?.architecture),
      ),
    [data],
  );
  const requested = params.get("view") as ViewId | null;
  const view: ViewId = requested && available.includes(requested) ? requested : "overview";

  const go = useCallback<LearnCtx["go"]>(
    (next, extra = {}) => {
      setParams({ ...(next === "overview" ? {} : { view: next }), ...extra });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setParams],
  );

  const setParam = useCallback(
    (key: string, value: string | null) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === null) next.delete(key);
          else next.set(key, value);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  if (!stack) return <NotFound />;

  if (!stack.load) {
    return (
      <div className="lp">
        <div className="lp-crumb"><Link to="/">Tools</Link><span>/</span><Link to="/resources">Learning portal</Link><span>/</span>{stack.name}</div>
        <div className="lp-empty lp-soon">
          <h1>{stack.name} is coming soon</h1>
          <p>{stack.blurb}</p>
          <Link className="lp-btn lp-btn--primary" to="/resources">Back to the learning portal</Link>
        </div>
      </div>
    );
  }

  const ctx: LearnCtx | null = data ? { stack, data, progress, toggle, go, params, setParam } : null;
  const done = data ? countDone(progress.studied, data.concepts.map((c) => c.id)) : 0;

  return (
    <div className="lp" style={{ ["--lp-accent" as string]: stack.accent }}>
      <div className="lp-crumb"><Link to="/">Tools</Link><span>/</span><Link to="/resources">Learning portal</Link><span>/</span>{stack.name}</div>

      <header className="lp-top">
        <div className="lp-top__id">
          <span className="lp-top__icon" aria-hidden="true">{stack.icon}</span>
          <div>
            <h1>{stack.name}</h1>
            <p>{stack.tagline}</p>
          </div>
        </div>
        {data && <GlobalSearch data={data} go={go} />}
      </header>

      <nav className="lp-tabs" aria-label={`${stack.name} sections`}>
        {available.map((v) => (
          <button key={v} type="button" aria-current={view === v ? "page" : undefined} onClick={() => go(v)}>{v === "patterns" ? (stack.patternsLabel ?? VIEW_LABEL[v]) : VIEW_LABEL[v]}</button>
        ))}
        {data && done > 0 && (
          <button type="button" className="lp-tabs__reset" onClick={() => window.confirm("Reset all your progress for this stack?") && reset()}>
            Reset progress
          </button>
        )}
      </nav>

      {failed && <div className="lp-empty">Couldn’t load this guide. Check your connection and reload.</div>}
      {!data && !failed && <div className="lp-empty" role="status">Loading {stack.name} guide…</div>}

      {ctx && (
        <div className="lp-view" key={view}>
          {view === "overview" && <Overview ctx={ctx} />}
          {view === "learn" && <Learn ctx={ctx} />}
          {view === "patterns" && <Patterns ctx={ctx} />}
          {view === "practice" && <Practice ctx={ctx} />}
          {view === "interview" && <Interview ctx={ctx} />}
          {view === "updates" && <Updates ctx={ctx} />}
          {view === "materials" && <Materials ctx={ctx} />}
        </div>
      )}
    </div>
  );
}
