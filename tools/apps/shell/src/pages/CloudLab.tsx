import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ARCH_AI, ARCH_EVENTS, ARCH_V1, ARCH_V2, ARCH_V3, ARCH_V4 } from "../learn/author/aws/arch.js";
import { stackPath, stacks, type Stack } from "../learn/catalog.js";
import { Rich } from "../learn/Rich.js";
import { ArchDiagram } from "../learn/visuals/CloudLabs.js";
import type { ArchVisual } from "../learn/visuals/types.js";

const cloudStacks = stacks.filter((s) => s.section === "cloud");
const AWS = "/cloud/aws";
/** Deep link into a concept of the AWS track. */
const concept = (id: string) => `${AWS}?view=learn&area=${id.split(":")[0]}&open=${id}`;
const area = (a: string) => `${AWS}?view=learn&area=${a}`;

/** "Evolve ShopNest": the same app at six stages of maturity. */
const STAGES: { id: string; tab: string; title: string; text: string; gains: string[]; costs: string[]; v: ArchVisual; link: string }[] = [
  { id: "v1", tab: "1 · One server", title: "Everything on one EC2 instance", text: "nginx, the Node API and MySQL share one machine. Quick to start — and one failure takes the whole shop down.", gains: ["Cheapest, simplest", "Easy to reason about"], costs: ["Single point of failure", "Backups only as good as cron", "Scale = bigger box"], v: ARCH_V1, link: "arch:0" },
  { id: "v2", tab: "2 · Highly available", title: "Three tiers across two AZs", text: "React on S3 + CloudFront, a stateless API in an Auto Scaling group behind a load balancer, RDS MySQL Multi-AZ and a cache.", gains: ["Survives an AZ failure", "Scales horizontally", "CDN-fast front end"], costs: ["More pieces to run", "Servers to patch"], v: ARCH_V2, link: "arch:1" },
  { id: "v3", tab: "3 · Containers", title: "The API on ECS Fargate", text: "CI builds one Docker image per commit; Fargate runs and scales it with rolling or blue/green deploys — no servers.", gains: ["No OS to patch", "Same image everywhere", "Safe, fast deploys"], costs: ["Container skills", "Pay per task even when idle"], v: ARCH_V3, link: "arch:2" },
  { id: "v4", tab: "4 · Serverless", title: "API Gateway, Lambda, Aurora Serverless", text: "Nothing runs when nobody shops. RDS Proxy shields the database from Lambda's burst; DynamoDB holds carts.", gains: ["Scale to zero", "Pay per request", "Little to operate"], costs: ["Cold starts", "Connection storms", "Many small parts to observe"], v: ARCH_V4, link: "arch:3" },
  { id: "events", tab: "5 · Event-driven", title: "Orders as events", text: "Checkout records the order and emits OrderPlaced; payment, stock and email react asynchronously with retries and dead-letter queues.", gains: ["Fast checkout", "Failures isolated", "Easy to add consumers"], costs: ["Eventual consistency", "Idempotency everywhere"], v: ARCH_EVENTS, link: "arch:4" },
  { id: "ai", tab: "6 · AI assistant", title: "A shopping assistant on Bedrock", text: "A Knowledge Base for policies, tools for live order data, Guardrails on both ends, streaming answers with citations, every token logged.", gains: ["Grounded, cited answers", "Live data through tools", "Safety enforced"], costs: ["Token costs to watch", "Needs an evaluation set"], v: ARCH_AI, link: "arch:5" },
];

/** "I need to…" → the service to reach for, and where it is taught. */
const NEEDS: { icon: string; need: string; answer: string; why: string; id: string }[] = [
  { icon: "⚛", need: "Host my React app", answer: "S3 + CloudFront (or Amplify Hosting)", why: "Static files from a private bucket through a CDN, with an index.html fallback for client-side routes.", id: "compute:8" },
  { icon: "🟢", need: "Run my Node API", answer: "ECS Fargate · Lambda Web Functions · ECS Express Mode", why: "Containers for steady traffic, Web Functions to run Express unchanged and scale to zero, Express Mode for a one-step HTTPS service.", id: "compute:9" },
  { icon: "🐬", need: "A MySQL database", answer: "RDS for MySQL 8.4 (or Aurora MySQL)", why: "Managed backups, patching and Multi-AZ failover; Aurora when you need fast failover and many replicas.", id: "data:3" },
  { icon: "🖼", need: "Store user uploads", answer: "S3 with presigned URLs", why: "The browser uploads straight to S3; the API only signs a short-lived permission.", id: "data:1" },
  { icon: "⚡", need: "Make pages faster", answer: "CloudFront + ElastiCache (Valkey)", why: "Cache static content at the edge and hot queries in memory with cache-aside.", id: "data:8" },
  { icon: "🪪", need: "Sign users in", answer: "Amazon Cognito", why: "Sign-up, MFA and social login; the API verifies the JWT on every request.", id: "iam:7" },
  { icon: "🗝", need: "Keep secrets out of code", answer: "Secrets Manager + IAM roles", why: "Rotated DB passwords, no access keys anywhere — the platform hands code temporary credentials.", id: "iam:5" },
  { icon: "📨", need: "Run background jobs", answer: "SQS + Lambda", why: "A durable queue absorbs bursts; workers retry, report partial failures and park poison messages in a DLQ.", id: "events:2" },
  { icon: "⏰", need: "Run a nightly task", answer: "EventBridge Scheduler", why: "Cron and one-off schedules at scale without a server running cron.", id: "events:4" },
  { icon: "🪜", need: "Multi-step order workflow", answer: "Step Functions", why: "Retries, branches, waits and compensation (refund if shipping fails) with a visible history.", id: "events:5" },
  { icon: "🚀", need: "Deploy on every push", answer: "GitHub Actions (OIDC) + AWS CDK", why: "No stored keys; infrastructure and app shipped by the same reviewed pipeline.", id: "ops:2" },
  { icon: "🚨", need: "Know when it breaks", answer: "CloudWatch alarms, logs and traces", why: "Alarm on 5xx rate, p99 latency and queue age; trace one slow request end to end.", id: "ops:4" },
  { icon: "🤖", need: "Add an AI chatbot", answer: "Amazon Bedrock (Converse API)", why: "Foundation models from several providers behind one API and IAM.", id: "ai:1" },
  { icon: "📚", need: "Answer from my documents", answer: "Bedrock Knowledge Bases", why: "Managed RAG: ingest from S3, retrieve, answer with citations.", id: "ai:4" },
  { icon: "📄", need: "Read invoices · moderate photos", answer: "Textract · Rekognition", why: "Ready-made AI services: one API call, no model work.", id: "ai:9" },
  { icon: "🚧", need: "Keep AI answers safe", answer: "Bedrock Guardrails", why: "Denied topics, prompt-attack filters and PII masking on input and output.", id: "ai:6" },
  { icon: "💰", need: "Control the bill", answer: "Budgets, right-sizing, Savings Plans", why: "Know what drives cost — NAT, data transfer, idle resources — and compare Lambda with containers.", id: "ops:7" },
  { icon: "🌍", need: "Survive a Region outage", answer: "Backup & restore → pilot light → active/active", why: "Pick the strategy from the business's RTO and RPO, then rehearse it.", id: "ops:8" },
];

const LABS = [
  { icon: "🔑", title: "IAM policy lab", text: "Toggle identity, resource and boundary policies and SCPs; watch AWS evaluate each request step by step.", id: "iam:1" },
  { icon: "🧮", title: "VPC subnet planner", text: "Drag the VPC and subnet sizes and the number of AZs; see every CIDR block and what fits.", id: "net:0" },
  { icon: "📈", title: "Auto scaling simulator", text: "Replay a flash-sale day; tune target, minimum and warm-up until no minute is overloaded.", id: "compute:2" },
  { icon: "🗺", title: "Architecture maps", text: "20 clickable diagrams: pick a request flow and follow it hop by hop; click any service for details.", id: "arch:1" },
  { icon: "📨", title: "Queue simulator", text: "Push orders faster than workers can handle and watch the SQS backlog grow and drain.", id: "events:1" },
  { icon: "💵", title: "Cost calculators", text: "Lambda vs Fargate at your traffic; what an LLM feature costs per month in tokens.", id: "ops:7" },
];

const PATHS = [
  { icon: "🧑‍💻", title: "Web developer path", text: "Take ShopNest from laptop to a production AWS setup.", areas: [["start", "Start here"], ["iam", "IAM & security"], ["net", "Networking"], ["compute", "Compute"], ["data", "Data"], ["events", "Serverless"], ["ops", "DevOps & cost"], ["arch", "Architectures"]] },
  { icon: "🧠", title: "AI developer path", text: "Just enough AWS to ship AI features safely, then Bedrock in depth.", areas: [["start", "Start here"], ["iam", "IAM & security"], ["compute", "Compute"], ["data", "Data"], ["events", "Serverless"], ["ai", "AI on AWS"], ["arch", "Architectures"]] },
];

const RING = ["☁", "λ", "🪣", "🐬", "🐳", "⚖", "🌐", "📨", "🔑", "🤖", "📊", "🗂"];

function studied(slug: string): number {
  try {
    const raw = localStorage.getItem(`toolnest-learn:${slug}`);
    return raw ? Object.keys((JSON.parse(raw) as { studied?: Record<string, true> }).studied ?? {}).length : 0;
  } catch {
    return 0;
  }
}

function ProviderCard({ s }: { s: Stack }) {
  const live = !!s.load;
  const done = live ? studied(s.slug) : 0;
  const pct = live && s.stats?.concepts ? Math.min(100, Math.round((done / s.stats.concepts) * 100)) : 0;
  const style = { ["--lp-accent" as string]: s.accent };
  const body = (
    <>
      <div className="cl-prov__top">
        <span className="cl-prov__icon" aria-hidden="true">{s.icon}</span>
        <span className={`lp-badge ${live ? "" : "lp-badge--quiet"}`}>{live ? "live" : "coming soon"}</span>
      </div>
      <h3>{s.name}</h3>
      <p>{s.tagline}</p>
      {live && s.stats ? (
        <>
          <ul className="cl-prov__stats">
            <li><b>{s.stats.concepts}</b> interactive concepts</li>
            <li><b>{s.stats.questions}</b> questions</li>
            <li><b>{s.stats.drills}</b> design scenarios</li>
            <li><b>{s.stats.codeLab}</b> hands-on labs</li>
          </ul>
          {done > 0 ? (
            <div className="cl-prov__progress"><span className="lp-bar"><i style={{ width: `${pct}%` }} /></span><small>{pct}% studied · continue →</small></div>
          ) : (
            <span className="cl-prov__cta">Start the track →</span>
          )}
        </>
      ) : (
        s.planned && <ul className="lp-track__plan">{s.planned.map((p) => <li key={p}>{p}</li>)}</ul>
      )}
    </>
  );
  return live ? <Link to={stackPath(s)} className="cl-prov is-live" style={style}>{body}</Link> : <div className="cl-prov is-soon" style={style}>{body}</div>;
}

export default function CloudLab() {
  const [stage, setStage] = useState(1);
  const [need, setNeed] = useState(0);

  useEffect(() => {
    document.title = "Cloud Lab — Learn AWS Interactively with a Real App | ToolNest";
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute(
      "content",
      "Learn AWS by building a React + Node.js + MySQL app: clickable architecture maps, an IAM policy lab, a VPC subnet planner, a scaling simulator, serverless, DevOps and AI on AWS with Bedrock.",
    );
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", "https://shashikant-hr.me/tools/cloud");
  }, []);

  const aws = cloudStacks.find((s) => s.slug === "aws");
  const st = (STAGES[stage] ?? STAGES[0]) as (typeof STAGES)[number];
  const n = (NEEDS[need] ?? NEEDS[0]) as (typeof NEEDS)[number];
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="lp cl" style={{ ["--lp-accent" as string]: "#e07000" }}>
      <section className="cl-hero" aria-labelledby="cl-title">
        <span className="cl-orb cl-orb--a" aria-hidden="true" />
        <span className="cl-orb cl-orb--b" aria-hidden="true" />
        <div className="cl-hero__copy">
          <span className="cl-kicker">TOOLNEST · CLOUD LAB</span>
          <h1 id="cl-title">Learn the cloud by <em>running a real app</em> on it.</h1>
          <p>One familiar app — <b>React</b>, <b>Node.js</b>, <b>MySQL</b> — taken from your laptop to production on AWS, then given AI features with Bedrock. Every concept is something you can click, drag or replay.</p>
          <div className="cl-hero__cta">
            <Link to={`${AWS}?view=learn`} className="cl-btn cl-btn--primary">Start the AWS track</Link>
            <button type="button" className="cl-btn" onClick={() => jump("cl-evolve")}>Watch ShopNest evolve ↓</button>
          </div>
        </div>
        <div className="cl-hero__ring" aria-hidden="true">
          <span className="cl-hero__core">AWS</span>
          {RING.map((icon, i) => (
            <span key={icon} className="cl-hero__chip" style={{ ["--i" as string]: i, ["--n" as string]: RING.length }}>{icon}</span>
          ))}
        </div>
        {aws?.stats && (
          <ul className="cl-hero__stats">
            <li><b>{aws.stats.concepts}</b><span>interactive concepts</span></li>
            <li><b>20</b><span>clickable architectures</span></li>
            <li><b>{aws.stats.questions}</b><span>interview questions</span></li>
            <li><b>{aws.stats.drills + aws.stats.codeLab}</b><span>scenarios & labs</span></li>
          </ul>
        )}
      </section>

      <section className="cl-section" aria-labelledby="cl-prov-title">
        <div className="lp-head"><div><span className="lp-eyebrow">CHOOSE A CLOUD</span><h2 id="cl-prov-title">Start with AWS, Azure is next</h2></div></div>
        <div className="cl-provs">{cloudStacks.map((s) => <ProviderCard key={s.slug} s={s} />)}</div>
      </section>

      <section id="cl-evolve" className="cl-section cl-evolve" aria-labelledby="cl-evolve-title">
        <div className="lp-head"><div><span className="lp-eyebrow">INTERACTIVE · SHOPNEST ON AWS</span><h2 id="cl-evolve-title">Watch one app grow up</h2></div></div>
        <p className="lp-muted cl-lead">Pick a stage, press play to follow a request through the architecture, and click any service to see why it is there.</p>
        <div className="cl-stages" role="tablist" aria-label="Architecture stage">
          {STAGES.map((s, i) => (
            <button key={s.id} type="button" role="tab" aria-selected={stage === i} onClick={() => setStage(i)}>{s.tab}</button>
          ))}
        </div>
        <div className="cl-evolve__body">
          <figure className="lp-visual cl-evolve__map">
            <figcaption><span className="lp-visual__kind">▶ Architecture map</span><span>Pick a flow · click a service</span></figcaption>
            <ArchDiagram key={st.id} v={st.v} />
            <p className="lp-visual__take"><b>Remember:</b> <Rich text={st.v.takeaway} /></p>
          </figure>
          <aside className="cl-evolve__side">
            <h3>{st.title}</h3>
            <p>{st.text}</p>
            <div className="cl-pros"><b>You gain</b><ul>{st.gains.map((g) => <li key={g}>{g}</li>)}</ul></div>
            <div className="cl-cons"><b>You take on</b><ul>{st.costs.map((c) => <li key={c}>{c}</li>)}</ul></div>
            <Link to={concept(st.link)} className="cl-btn cl-btn--primary">Learn this stage →</Link>
            <div className="cl-evolve__nav">
              <button type="button" className="lp-btn" disabled={stage === 0} onClick={() => setStage((x) => x - 1)}>← Previous</button>
              <button type="button" className="lp-btn" disabled={stage === STAGES.length - 1} onClick={() => setStage((x) => x + 1)}>Next stage →</button>
            </div>
          </aside>
        </div>
      </section>

      <section className="cl-section" aria-labelledby="cl-need-title">
        <div className="lp-head"><div><span className="lp-eyebrow">SERVICE FINDER</span><h2 id="cl-need-title">I need to…</h2></div></div>
        <div className="cl-finder">
          <div className="cl-needs" role="listbox" aria-label="What do you need to do?">
            {NEEDS.map((x, i) => (
              <button key={x.need} type="button" role="option" aria-selected={need === i} onClick={() => setNeed(i)}><span aria-hidden="true">{x.icon}</span>{x.need}</button>
            ))}
          </div>
          {n && (
            <div className="cl-answer" aria-live="polite">
              <span className="cl-answer__icon" aria-hidden="true">{n.icon}</span>
              <small>To “{n.need.toLowerCase()}”, reach for</small>
              <h3>{n.answer}</h3>
              <p>{n.why}</p>
              <Link to={concept(n.id)} className="cl-btn cl-btn--primary">Open the interactive concept →</Link>
            </div>
          )}
        </div>
      </section>

      <section className="cl-section" aria-labelledby="cl-labs-title">
        <div className="lp-head"><div><span className="lp-eyebrow">HANDS ON</span><h2 id="cl-labs-title">Labs you can play with</h2></div></div>
        <div className="cl-labs">
          {LABS.map((l) => (
            <Link key={l.title} to={concept(l.id)} className="cl-lab">
              <span className="cl-lab__icon" aria-hidden="true">{l.icon}</span>
              <h3>{l.title}</h3>
              <p>{l.text}</p>
              <span className="cl-lab__go">Open lab →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="cl-section" aria-labelledby="cl-paths-title">
        <div className="lp-head"><div><span className="lp-eyebrow">LEARNING PATHS</span><h2 id="cl-paths-title">Two ways through the AWS track</h2></div></div>
        <div className="cl-paths">
          {PATHS.map((p) => (
            <article key={p.title} className="cl-path">
              <header><span aria-hidden="true">{p.icon}</span><div><h3>{p.title}</h3><p>{p.text}</p></div></header>
              <ol>{p.areas.map(([id, label], i) => <li key={id}><Link to={area(id as string)}><i>{i + 1}</i>{label}</Link></li>)}</ol>
            </article>
          ))}
        </div>
      </section>

      <p className="lp-muted lp-note cl-foot">Service limits, versions and prices were checked against the official AWS documentation on 17 October 2026. Labs run entirely in your browser; your progress stays on this device.</p>
    </div>
  );
}
