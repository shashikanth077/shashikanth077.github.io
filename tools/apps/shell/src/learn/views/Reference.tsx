import { useMemo, useState } from "react";
import type { LearnCtx } from "../ctx.js";

const DAY = 86_400_000;
const PHASE_LABEL: Record<string, string> = { alp: "Alpha", cur: "Current", act: "Active LTS", mnt: "Maintenance" };

/** Release timeline + built-in features that replace packages. Only present when the handbook has a platform section. */
export function Updates({ ctx }: { ctx: LearnCtx }) {
  const platform = ctx.data.platform;
  const [group, setGroup] = useState("All");
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const range = useMemo(() => {
    if (!platform) return { min: 0, max: 1 };
    const all = platform.releases.flatMap((r) => r.phases.flatMap((p) => [Date.parse(p.from), Date.parse(p.to)]));
    return { min: Math.min(...all), max: Math.max(...all) };
  }, [platform]);

  if (!platform) return null;
  const span = range.max - range.min;
  const now = Date.now();
  const nowPct = Math.min(100, Math.max(0, ((now - range.min) / span) * 100));
  const years: number[] = [];
  for (let y = new Date(range.min).getUTCFullYear() + 1; Date.UTC(y, 0, 1) < range.max; y++) years.push(y);
  const groups = ["All", ...new Set(platform.features.map((f) => f.group))];
  const features = platform.features.filter((f) => group === "All" || f.group === group);
  const pct = (iso: string) => ((Date.parse(iso) - range.min) / span) * 100;

  return (
    <div className="lp-stack">
      <section className="lp-card">
        <span className="lp-eyebrow">RELEASE LINES</span>
        <h2>Know which line you run — and when it stops getting patches</h2>
        <div className="lp-legend"><span className="p-cur">Current</span><span className="p-act">Active LTS</span><span className="p-mnt">Maintenance</span></div>
        <div className="lp-gantt" role="img" aria-label="Release timeline">
          <div className="lp-gantt__axis">
            {years.map((y) => <span key={y} style={{ left: `${pct(`${y}-01-01`)}%` }}>{y}</span>)}
          </div>
          {platform.releases.map((r) => (
            <div key={r.name} className="lp-gantt__row">
              <b>{r.name}</b>
              <div className="lp-gantt__track">
                {r.phases.map((p) => (
                  <i
                    key={p.kind + p.from}
                    className={`p-${p.kind}`}
                    style={{ left: `${pct(p.from)}%`, width: `${Math.max(0.5, ((Date.parse(p.to) - Date.parse(p.from)) / span) * 100)}%` }}
                    title={`${r.name} · ${p.label || PHASE_LABEL[p.kind]}: ${p.from} → ${p.to}`}
                  />
                ))}
              </div>
            </div>
          ))}
          <span className="lp-gantt__now" style={{ left: `calc(4.5rem + (100% - 4.5rem) * ${nowPct / 100})` }} title={`Today · ${new Date(now - (now % DAY)).toISOString().slice(0, 10)}`} />
        </div>
        <p className="lp-muted lp-note">Dates follow the published release schedule at the time of writing. Verify against the official release page before planning an upgrade.</p>
      </section>

      <section>
        <h3 className="lp-sub">Built-ins that replace dependencies</h3>
        <div className="lp-chips" role="group" aria-label="Filter features">
          {groups.map((g) => <button key={g} type="button" aria-pressed={group === g} onClick={() => setGroup(g)}>{g}</button>)}
        </div>
        <div className="lp-tiles lp-gap-top">
          {features.map((f) => (
            <div key={f.name} className="lp-card">
              <div className="lp-feature__top"><strong>{f.name}</strong><span className="lp-badge">v{f.since}</span></div>
              <small className="lp-muted">{f.group}</small>
              <p>{f.note}</p>
            </div>
          ))}
        </div>
      </section>

      {platform.upgradeChecklist.length > 0 && (
        <section className="lp-card">
          <h3>Upgrade checklist</h3>
          <ul className="lp-checklist">
            {platform.upgradeChecklist.map((item, i) => (
              <li key={item}>
                <label><input type="checkbox" checked={!!checked[i]} onChange={() => setChecked({ ...checked, [i]: !checked[i] })} /> <span>{item}</span></label>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export function Materials({ ctx }: { ctx: LearnCtx }) {
  return (
    <div className="lp-stack">
      <p className="lp-muted lp-lead">Primary sources first, then books worth owning.</p>
      <div className="lp-tiles">
        {ctx.data.materials.map((m) => (
          <section key={m.title} className="lp-card">
            <h3>{m.title}</h3>
            <ul className="lp-links">
              {m.links.map((l) => (
                <li key={l.url}>
                  {/^https?:\/\//.test(l.url) ? <a href={l.url} target="_blank" rel="noopener noreferrer">{l.label} <span aria-hidden="true">↗</span></a> : l.label}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
