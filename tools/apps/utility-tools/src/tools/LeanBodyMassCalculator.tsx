import { useState } from "react";
import { Button, Note, Panel, ToolFrame } from "@devtools/ui";
import {
  calcLbm, calcLbmFromBodyFat, findTool,
  ftInToCm, kgToLbs, lbsToKg,
  type Gender, type UnitSystem,
} from "@devtools/tools-core";
import "./HealthCalc.css";

export default function LeanBodyMassCalculator() {
  const route = findTool("lean-body-mass-calculator");
  const [units, setUnits]     = useState<UnitSystem>("metric");
  const [gender, setGender]   = useState<Gender>("male");
  const [mode, setMode]       = useState<"estimate" | "bodyfat">("estimate");
  const [weightKg, setWeightKg]     = useState("");
  const [weightLbs, setWeightLbs]   = useState("");
  const [heightCm, setHeightCm]     = useState("");
  const [heightFt, setHeightFt]     = useState("");
  const [heightIn, setHeightIn]     = useState("");
  const [bodyFatPct, setBodyFatPct] = useState("");

  type Res = { lbmKg: number; fatKg: number; wKg: number; boer?: number; james?: number };
  const [result, setResult] = useState<Res | null>(null);
  const [error, setError]   = useState<string | null>(null);

  function calculate() {
    setError(null);
    let wKg: number;
    if (units === "metric") wKg = parseFloat(weightKg);
    else wKg = lbsToKg(parseFloat(weightLbs));
    if (!isFinite(wKg) || wKg <= 0) { setError("Enter a valid weight."); return; }

    if (mode === "bodyfat") {
      const pct = parseFloat(bodyFatPct);
      if (!isFinite(pct) || pct <= 0 || pct >= 100) { setError("Enter a valid body fat percentage (1–99)."); return; }
      const lbmKg = calcLbmFromBodyFat(wKg, pct);
      setResult({ lbmKg, fatKg: wKg - lbmKg, wKg });
    } else {
      let hCm: number;
      if (units === "metric") hCm = parseFloat(heightCm);
      else hCm = ftInToCm(parseFloat(heightFt) || 0, parseFloat(heightIn) || 0);
      if (!isFinite(hCm) || hCm <= 0) { setError("Enter a valid height."); return; }
      const { boer, james, average } = calcLbm(wKg, hCm, gender);
      setResult({ lbmKg: average, fatKg: wKg - average, wKg, boer, james });
    }
  }

  return (
    <ToolFrame title={route?.name ?? "Lean Body Mass Calculator"} tagline={route?.tagline ?? ""}>
      <Panel title="Your measurements">
        <div className="hc-top-row">
          <div className="hc-unit-toggle">
            <button className={`hc-unit-toggle__btn${mode === "estimate" ? " hc-unit-toggle__btn--active" : ""}`} onClick={() => setMode("estimate")}>Height-based estimate</button>
            <button className={`hc-unit-toggle__btn${mode === "bodyfat" ? " hc-unit-toggle__btn--active" : ""}`} onClick={() => setMode("bodyfat")}>I know my body fat %</button>
          </div>
          <div className="hc-unit-toggle">
            <button className={`hc-unit-toggle__btn${units === "metric" ? " hc-unit-toggle__btn--active" : ""}`} onClick={() => setUnits("metric")}>Metric</button>
            <button className={`hc-unit-toggle__btn${units === "imperial" ? " hc-unit-toggle__btn--active" : ""}`} onClick={() => setUnits("imperial")}>Imperial</button>
          </div>
        </div>

        {mode === "estimate" && (
          <div className="hc-field" style={{ marginTop: "var(--space-3)" }}>
            <label className="hc-field__label">Biological sex</label>
            <div className="hc-gender">
              <button className={`hc-gender__opt${gender === "male" ? " hc-gender__opt--active" : ""}`} onClick={() => setGender("male")}>Male</button>
              <button className={`hc-gender__opt${gender === "female" ? " hc-gender__opt--active" : ""}`} onClick={() => setGender("female")}>Female</button>
            </div>
          </div>
        )}

        <div className="hc-grid" style={{ marginTop: "var(--space-3)" }}>
          {units === "metric" ? (
            <div className="hc-field">
              <label className="hc-field__label">Weight</label>
              <div className="hc-field__input-wrap"><input className="dt-input" type="number" min="1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="70" /><span className="hc-field__unit">kg</span></div>
            </div>
          ) : (
            <div className="hc-field">
              <label className="hc-field__label">Weight</label>
              <div className="hc-field__input-wrap"><input className="dt-input" type="number" min="1" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} placeholder="154" /><span className="hc-field__unit">lbs</span></div>
            </div>
          )}

          {mode === "estimate" && (units === "metric" ? (
            <div className="hc-field">
              <label className="hc-field__label">Height</label>
              <div className="hc-field__input-wrap"><input className="dt-input" type="number" min="50" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="175" /><span className="hc-field__unit">cm</span></div>
            </div>
          ) : (
            <>
              <div className="hc-field">
                <label className="hc-field__label">Height (ft)</label>
                <div className="hc-field__input-wrap"><input className="dt-input" type="number" min="1" max="9" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} placeholder="5" /><span className="hc-field__unit">ft</span></div>
              </div>
              <div className="hc-field">
                <label className="hc-field__label">Height (in)</label>
                <div className="hc-field__input-wrap"><input className="dt-input" type="number" min="0" max="11" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} placeholder="9" /><span className="hc-field__unit">in</span></div>
              </div>
            </>
          ))}

          {mode === "bodyfat" && (
            <div className="hc-field">
              <label className="hc-field__label">Body fat %</label>
              <div className="hc-field__input-wrap"><input className="dt-input" type="number" min="1" max="99" value={bodyFatPct} onChange={(e) => setBodyFatPct(e.target.value)} placeholder="18" /><span className="hc-field__unit">%</span></div>
            </div>
          )}
        </div>

        {error && <div style={{ marginTop: "var(--space-2)" }}><Note kind="error">{error}</Note></div>}
        <Button variant="primary" onClick={calculate} style={{ marginTop: "var(--space-3)", width: "100%" }}>
          Calculate Lean Mass
        </Button>
      </Panel>

      {result ? (
        <div className="hc-result">
          <div className="hc-result__header"><span className="hc-result__title">Lean Body Mass</span></div>
          <div className="hc-result__body">
            <div className="hc-big">
              <span className="hc-big__value" style={{ color: "var(--tk-health,#0D9488)" }}>{result.lbmKg.toFixed(1)}</span>
              <span className="hc-big__unit">kg</span>
            </div>
            <div className="hc-stats">
              <div className="hc-stat">
                <span className="hc-stat__label">Lean mass</span>
                <span className="hc-stat__value">{result.lbmKg.toFixed(1)} kg</span>
                <span className="hc-stat__sub">{kgToLbs(result.lbmKg).toFixed(1)} lbs</span>
              </div>
              <div className="hc-stat">
                <span className="hc-stat__label">Fat mass</span>
                <span className="hc-stat__value">{result.fatKg.toFixed(1)} kg</span>
                <span className="hc-stat__sub">{kgToLbs(result.fatKg).toFixed(1)} lbs</span>
              </div>
              <div className="hc-stat">
                <span className="hc-stat__label">Lean %</span>
                <span className="hc-stat__value">{((result.lbmKg / result.wKg) * 100).toFixed(1)}%</span>
              </div>
              {result.boer !== undefined && (
                <div className="hc-stat">
                  <span className="hc-stat__label">Boer formula</span>
                  <span className="hc-stat__value">{result.boer.toFixed(1)} kg</span>
                </div>
              )}
              {result.james !== undefined && (
                <div className="hc-stat">
                  <span className="hc-stat__label">James formula</span>
                  <span className="hc-stat__value">{result.james.toFixed(1)} kg</span>
                </div>
              )}
            </div>
            <p className="hc-note">
              Lean body mass includes muscle, bone, organs and body water — everything except fat.
              Height-based estimates (Boer/James) are less precise than direct body fat measurement.
            </p>
          </div>
        </div>
      ) : (
        <div className="hc-result"><div className="hc-empty"><span className="hc-empty__icon">🏋️</span><span>Enter your details and click <strong>Calculate Lean Mass</strong>.</span></div></div>
      )}
    </ToolFrame>
  );
}
