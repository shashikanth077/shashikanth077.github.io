import { Rich } from "../Rich.js";
import type { CompareVisual, LanesVisual, LayersVisual } from "./types.js";
import type { Stepper } from "./useStepper.js";

export function LanesDiagram({ v, s }: { v: LanesVisual; s: Stepper }) {
  const t = s.step;
  const pct = (n: number) => `${(n / v.length) * 100}%`;
  return (
    <div className="lp-lanes" role="img" aria-label={v.takeaway}>
      <div className="lp-lanes__axis" aria-hidden="true">
        {Array.from({ length: v.length }, (_, i) => <span key={i} className={i <= t ? "is-on" : ""} style={{ width: pct(1) }}>{i + 1}</span>)}
      </div>
      {v.lanes.map((lane) => (
        <div key={lane.name} className="lp-lanes__row">
          <b>{lane.name}</b>
          <div className="lp-lanes__track">
            {lane.blocks.map((b, i) => {
              if (b.start > t) return null;
              const shown = Math.min(b.len, t - b.start + 1);
              return (
                <i key={i} className={`tone-${b.tone ?? "info"}${t < b.start + b.len ? " is-live" : ""}`} style={{ left: pct(b.start), width: pct(shown) }} title={plain(b.label)}>
                  <span>{plain(b.label)}</span>
                </i>
              );
            })}
            <em className="lp-lanes__head" style={{ left: pct(t + 1) }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const plain = (t: string) => t.replace(/\{\{(.+?)\}\}/g, (_, a: string) => a.trim());

export function CompareDiagram({ v, s }: { v: CompareVisual; s: Stepper }) {
  return (
    <div className="lp-table lp-cmp" role="group" aria-label={v.takeaway}>
      <table>
        <thead>
          <tr>
            <th aria-hidden="true" />
            {v.heads.map((h, i) => <th key={i} className={v.pick === i ? "is-pick" : ""}>{h}{v.pick === i && <span className="lp-badge">usual pick</span>}</th>)}
          </tr>
        </thead>
        <tbody>
          {v.rows.map((r, i) => (
            <tr key={i} className={i <= s.step ? "is-shown" : "is-hidden"}>
              <th scope="row">{r.label}</th>
              {r.cells.map((c, k) => <td key={k} className={v.pick === k ? "is-pick" : ""}><Rich text={c} /></td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LayersDiagram({ v, s }: { v: LayersVisual; s: Stepper }) {
  return (
    <div className="lp-layers" role="group" aria-label={v.takeaway}>
      {v.direction && <div className="lp-layers__dir" aria-hidden="true"><span>{v.direction}</span><i>↓</i></div>}
      <ol>
        {v.layers.map((l, i) => (
          <li key={i} className={`tone-${l.tone ?? "plain"}${i === s.step ? " is-now" : ""}${i < s.step ? " is-past" : ""}`}>
            <b>{l.label}</b>
            <span><Rich text={l.detail} /></span>
          </li>
        ))}
      </ol>
    </div>
  );
}
