import { useMemo } from "react";
import { plain } from "../Rich.js";
import type { CellsRow, CellsVisual, TraceVisual } from "./types.js";
import type { Stepper } from "./useStepper.js";

/** Running variable state and printed output after executing step `at`. */
function traceState(v: TraceVisual, at: number) {
  const vars = new Map<string, string>();
  const out: string[] = [];
  for (let i = 0; i <= at; i++) {
    const s = v.steps[i];
    if (!s) continue;
    for (const [k, val] of Object.entries(s.set ?? {})) vars.set(k, val);
    if (s.out) out.push(...s.out.split("\n"));
  }
  return { vars: [...vars.entries()], out };
}

export function TraceDiagram({ v, s }: { v: TraceVisual; s: Stepper }) {
  const cur = v.steps[s.step];
  const changed = new Set(Object.keys(cur?.set ?? {}));
  const { vars, out } = useMemo(() => traceState(v, s.step), [v, s.step]);
  const ran = new Set(v.steps.slice(0, s.step).map((x) => x.line));

  return (
    <div className="lp-trace" role="group" aria-label={v.takeaway}>
      <div className="lp-trace__code" aria-hidden="true">
        {v.code.map((line, i) => {
          const n = i + 1;
          return (
            <div key={i} className={`lp-trace__line${cur?.line === n ? " is-now" : ran.has(n) ? " is-ran" : ""}`}>
              <span>{n}</span>
              <code>{line || " "}</code>
            </div>
          );
        })}
      </div>
      <div className="lp-trace__side">
        <div className="lp-trace__panel">
          <h5>Variables</h5>
          {vars.length === 0 ? <p className="lp-trace__empty">nothing yet</p> : (
            <ul>
              {vars.map(([k, val]) => (
                <li key={k + (changed.has(k) ? s.step : "")} className={changed.has(k) ? "is-changed" : ""}>
                  <b>{k}</b><span>{plain(val)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="lp-trace__panel lp-trace__console">
          <h5>Output</h5>
          {out.length === 0 ? <p className="lp-trace__empty">no output yet</p> : <pre>{out.join("\n")}</pre>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function rowsAt(v: CellsVisual, at: number): CellsRow[] {
  let rows = v.rows;
  for (let i = 0; i <= at; i++) rows = v.steps[i]?.rows ?? rows;
  return rows;
}

export function CellsDiagram({ v, s }: { v: CellsVisual; s: Stepper }) {
  const rows = rowsAt(v, s.step);
  const prev = s.step > 0 ? rowsAt(v, s.step - 1) : rows;
  const hl = v.steps[s.step]?.hl ?? [];
  const lit = (r: number, c: number) => hl.some(([rr, from, to]) => rr === r && c >= from && c <= to);
  const dimmed = hl.length > 0;

  return (
    <div className="lp-cells" role="group" aria-label={v.takeaway}>
      {rows.map((row, r) => {
        const before = prev.find((p) => p.name === row.name);
        const n = row.cells.length;
        return (
          <div key={row.name} className={`lp-cells__row kind-${row.kind}`}>
            <b className="lp-cells__name">{row.name}<small>{row.kind === "plain" ? "" : row.kind}</small></b>
            <div className="lp-cells__boxes">
              {row.kind === "list" && <span className="lp-cells__br">[</span>}
              {row.kind === "tuple" && <span className="lp-cells__br">(</span>}
              {row.kind === "dict" && <span className="lp-cells__br">{"{"}</span>}
              {row.cells.map((cell, c) => {
                const isNew = !!before && before.cells[c] !== cell;
                const [k, val] = row.kind === "dict" ? cell.split("|") : [undefined, cell];
                return (
                  <div key={`${c}-${cell}`} className={`lp-cells__cell${lit(r, c) ? " is-hit" : dimmed ? " is-dim" : ""}${isNew ? " is-new" : ""}`}>
                    {k !== undefined && <span className="lp-cells__key">{plain(k)}</span>}
                    <span className="lp-cells__val">{plain(val ?? "")}</span>
                    {row.index === "pos" && <i>{c}</i>}
                    {row.index === "posneg" && <i>{c}<em>{c - n}</em></i>}
                  </div>
                );
              })}
              {row.kind === "list" && <span className="lp-cells__br">]</span>}
              {row.kind === "tuple" && <span className="lp-cells__br">)</span>}
              {row.kind === "dict" && <span className="lp-cells__br">{"}"}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
