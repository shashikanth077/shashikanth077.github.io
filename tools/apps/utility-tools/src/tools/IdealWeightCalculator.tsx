import { useState } from "react";
import { Button, Note, Panel, ToolFrame } from "@devtools/ui";
import {
  calcIdealWeight, findTool,
  ftInToCm,
  type Gender, type UnitSystem,
} from "@devtools/tools-core";
import "./HealthCalc.css";

export default function IdealWeightCalculator() {
  const route = findTool("ideal-weight-calculator");
  const [units, setUnits]   = useState<UnitSystem>("metric");
  const [gender, setGender] = useState<Gender>("male");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [results, setResults] = useState<ReturnType<typeof calcIdealWeight> | null>(null);
  const [error, setError]    = useState<string | null>(null);

  function calculate() {
    setError(null);
    let hCm: number;
    if (units === "metric") {
      hCm = parseFloat(heightCm);
    } else {
      hCm = ftInToCm(parseFloat(heightFt) || 0, parseFloat(heightIn) || 0);
    }
    if (!isFinite(hCm) || hCm < 100 || hCm > 280) { setError("Enter a valid height (100–280 cm)."); return; }
    setResults(calcIdealWeight(hCm, gender));
  }

  const show = units === "metric"
    ? (r: ReturnType<typeof calcIdealWeight>[number]) => `${r.kg.toFixed(1)} kg`
    : (r: ReturnType<typeof calcIdealWeight>[number]) => `${r.lbs.toFixed(1)} lbs`;

  return (
    <ToolFrame title={route?.name ?? "Ideal Weight Calculator"} tagline={route?.tagline ?? ""}>
      <Panel title="Your details">
        <div className="hc-top-row">
          <span className="hc-field__label">Unit system</span>
          <div className="hc-unit-toggle">
            <button className={`hc-unit-toggle__btn${units === "metric" ? " hc-unit-toggle__btn--active" : ""}`} onClick={() => setUnits("metric")}>Metric</button>
            <button className={`hc-unit-toggle__btn${units === "imperial" ? " hc-unit-toggle__btn--active" : ""}`} onClick={() => setUnits("imperial")}>Imperial</button>
          </div>
        </div>

        <div className="hc-field" style={{ marginTop: "var(--space-3)" }}>
          <label className="hc-field__label">Biological sex</label>
          <div className="hc-gender">
            <button className={`hc-gender__opt${gender === "male" ? " hc-gender__opt--active" : ""}`} onClick={() => setGender("male")}>Male</button>
            <button className={`hc-gender__opt${gender === "female" ? " hc-gender__opt--active" : ""}`} onClick={() => setGender("female")}>Female</button>
          </div>
        </div>

        <div className="hc-grid" style={{ marginTop: "var(--space-3)" }}>
          {units === "metric" ? (
            <div className="hc-field">
              <label className="hc-field__label">Height</label>
              <div className="hc-field__input-wrap"><input className="dt-input" type="number" min="100" max="280" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="175" /><span className="hc-field__unit">cm</span></div>
            </div>
          ) : (
            <>
              <div className="hc-field">
                <label className="hc-field__label">Height (ft)</label>
                <div className="hc-field__input-wrap"><input className="dt-input" type="number" min="3" max="9" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} placeholder="5" /><span className="hc-field__unit">ft</span></div>
              </div>
              <div className="hc-field">
                <label className="hc-field__label">Height (in)</label>
                <div className="hc-field__input-wrap"><input className="dt-input" type="number" min="0" max="11" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} placeholder="9" /><span className="hc-field__unit">in</span></div>
              </div>
            </>
          )}
        </div>

        {error && <div style={{ marginTop: "var(--space-2)" }}><Note kind="error">{error}</Note></div>}
        <Button variant="primary" onClick={calculate} style={{ marginTop: "var(--space-3)", width: "100%" }}>
          Calculate Ideal Weight
        </Button>
      </Panel>

      {results ? (
        <div className="hc-result">
          <div className="hc-result__header"><span className="hc-result__title">Ideal Body Weight</span></div>
          <div className="hc-result__body">
            <div className="hc-big">
              <span className="hc-big__value" style={{ color: "var(--tk-health,#0D9488)" }}>
                {show(results[0]!)}
              </span>
              <span className="hc-big__unit" style={{ fontSize: "0.9rem" }}>Hamwi (primary)</span>
            </div>

            <table className="hc-table">
              <thead>
                <tr>
                  <th>Formula</th>
                  <th>Ideal weight</th>
                  <th style={{ display: "none" }}>Note</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.formula}>
                    <td>
                      <div className="hc-table__formula">{r.formula}</div>
                      <div className="hc-table__note">{r.note}</div>
                    </td>
                    <td className="hc-table__val">{show(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="hc-note">
              Ideal body weight formulas were designed for clinical settings (e.g., medication dosing) and are not body-composition targets.
              The BMI-based healthy weight range is often more practical for general health goals.
            </p>
          </div>
        </div>
      ) : (
        <div className="hc-result"><div className="hc-empty"><span className="hc-empty__icon">🎯</span><span>Enter your height and click <strong>Calculate Ideal Weight</strong>.</span></div></div>
      )}
    </ToolFrame>
  );
}
