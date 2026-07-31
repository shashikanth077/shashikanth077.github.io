import { useState } from "react";
import { Button, Note, Panel, ToolFrame } from "@devtools/ui";
import { calcBsa, findTool, ftInToCm, lbsToKg, type UnitSystem } from "@devtools/tools-core";
import "./HealthCalc.css";

export default function BodySurfaceAreaCalculator() {
  const route = findTool("body-surface-area-calculator");
  const [units, setUnits]       = useState<UnitSystem>("metric");
  const [weightKg, setWeightKg] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [result, setResult]     = useState<ReturnType<typeof calcBsa> | null>(null);
  const [error, setError]       = useState<string | null>(null);

  function calculate() {
    setError(null);
    let wKg: number, hCm: number;
    if (units === "metric") {
      wKg = parseFloat(weightKg);
      hCm = parseFloat(heightCm);
    } else {
      wKg = lbsToKg(parseFloat(weightLbs));
      hCm = ftInToCm(parseFloat(heightFt) || 0, parseFloat(heightIn) || 0);
    }
    if (!isFinite(wKg) || wKg <= 0) { setError("Enter a valid weight."); return; }
    if (!isFinite(hCm) || hCm <= 0) { setError("Enter a valid height."); return; }
    setResult(calcBsa(wKg, hCm));
  }

  const FORMULAS = [
    { key: "mosteller" as const, name: "Mosteller",  note: "Most widely used in clinical practice" },
    { key: "dubois"    as const, name: "DuBois",     note: "Oldest formula, 1916; used in cardiac output" },
    { key: "haycock"   as const, name: "Haycock",    note: "More accurate for children and small adults" },
  ];

  return (
    <ToolFrame title={route?.name ?? "Body Surface Area Calculator"} tagline={route?.tagline ?? ""}>
      <Panel title="Your measurements">
        <div className="hc-top-row">
          <span className="hc-field__label">Unit system</span>
          <div className="hc-unit-toggle">
            <button className={`hc-unit-toggle__btn${units === "metric" ? " hc-unit-toggle__btn--active" : ""}`} onClick={() => setUnits("metric")}>Metric</button>
            <button className={`hc-unit-toggle__btn${units === "imperial" ? " hc-unit-toggle__btn--active" : ""}`} onClick={() => setUnits("imperial")}>Imperial</button>
          </div>
        </div>

        <div className="hc-grid" style={{ marginTop: "var(--space-3)" }}>
          {units === "metric" ? (
            <>
              <div className="hc-field">
                <label className="hc-field__label">Weight</label>
                <div className="hc-field__input-wrap"><input className="dt-input" type="number" min="1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="70" /><span className="hc-field__unit">kg</span></div>
              </div>
              <div className="hc-field">
                <label className="hc-field__label">Height</label>
                <div className="hc-field__input-wrap"><input className="dt-input" type="number" min="50" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="175" /><span className="hc-field__unit">cm</span></div>
              </div>
            </>
          ) : (
            <>
              <div className="hc-field">
                <label className="hc-field__label">Weight</label>
                <div className="hc-field__input-wrap"><input className="dt-input" type="number" min="1" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} placeholder="154" /><span className="hc-field__unit">lbs</span></div>
              </div>
              <div className="hc-field">
                <label className="hc-field__label">Height (ft)</label>
                <div className="hc-field__input-wrap"><input className="dt-input" type="number" min="1" max="9" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} placeholder="5" /><span className="hc-field__unit">ft</span></div>
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
          Calculate BSA
        </Button>
      </Panel>

      {result ? (
        <div className="hc-result">
          <div className="hc-result__header"><span className="hc-result__title">Body Surface Area</span></div>
          <div className="hc-result__body">
            <div className="hc-big">
              <span className="hc-big__value" style={{ color: "var(--tk-health,#0D9488)" }}>{result.average.toFixed(3)}</span>
              <span className="hc-big__unit">m² (avg)</span>
            </div>

            <table className="hc-table">
              <thead>
                <tr>
                  <th>Formula</th>
                  <th>BSA (m²)</th>
                </tr>
              </thead>
              <tbody>
                {FORMULAS.map(({ key, name, note }) => (
                  <tr key={key}>
                    <td>
                      <div className="hc-table__formula">{name}</div>
                      <div className="hc-table__note">{note}</div>
                    </td>
                    <td className="hc-table__val">{result[key].toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="hc-stats">
              <div className="hc-stat">
                <span className="hc-stat__label">Typical adult BSA</span>
                <span className="hc-stat__value">1.6–2.0 m²</span>
              </div>
              <div className="hc-stat">
                <span className="hc-stat__label">Average (your result)</span>
                <span className="hc-stat__value">{result.average.toFixed(3)} m²</span>
              </div>
            </div>

            <p className="hc-note">
              BSA is used clinically for drug dosing (especially chemotherapy), cardiac output, and burn area estimation.
              The Mosteller formula is recommended for most adult clinical use.
            </p>
          </div>
        </div>
      ) : (
        <div className="hc-result"><div className="hc-empty"><span className="hc-empty__icon">🧬</span><span>Enter your weight and height and click <strong>Calculate BSA</strong>.</span></div></div>
      )}
    </ToolFrame>
  );
}
