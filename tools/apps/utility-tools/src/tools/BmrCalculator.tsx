import { useState } from "react";
import { Button, Note, Panel, ToolFrame } from "@devtools/ui";
import {
  calcBmr, findTool, ftInToCm, lbsToKg,
  type Gender, type UnitSystem,
} from "@devtools/tools-core";
import "./HealthCalc.css";

export default function BmrCalculator() {
  const route = findTool("bmr-calculator");
  const [units, setUnits]       = useState<UnitSystem>("metric");
  const [gender, setGender]     = useState<Gender>("male");
  const [weightKg, setWeightKg] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [age, setAge]           = useState("");
  const [bmr, setBmr]           = useState<number | null>(null);
  const [error, setError]       = useState<string | null>(null);

  function calculate() {
    setError(null);
    let wKg: number, hCm: number, ageN: number;

    if (units === "metric") {
      wKg = parseFloat(weightKg);
      hCm = parseFloat(heightCm);
    } else {
      wKg = lbsToKg(parseFloat(weightLbs));
      hCm = ftInToCm(parseFloat(heightFt) || 0, parseFloat(heightIn) || 0);
    }
    ageN = parseFloat(age);

    if (!isFinite(wKg) || wKg <= 0)   { setError("Enter a valid weight."); return; }
    if (!isFinite(hCm) || hCm <= 0)   { setError("Enter a valid height."); return; }
    if (!isFinite(ageN) || ageN <= 0 || ageN > 120) { setError("Enter a valid age (1–120)."); return; }

    setBmr(calcBmr(wKg, hCm, ageN, gender));
  }

  return (
    <ToolFrame title={route?.name ?? "BMR Calculator"} tagline={route?.tagline ?? ""}>
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
            <>
              <div className="hc-field">
                <label className="hc-field__label">Weight</label>
                <div className="hc-field__input-wrap">
                  <input className="dt-input" type="number" min="1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="70" />
                  <span className="hc-field__unit">kg</span>
                </div>
              </div>
              <div className="hc-field">
                <label className="hc-field__label">Height</label>
                <div className="hc-field__input-wrap">
                  <input className="dt-input" type="number" min="50" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="175" />
                  <span className="hc-field__unit">cm</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="hc-field">
                <label className="hc-field__label">Weight</label>
                <div className="hc-field__input-wrap">
                  <input className="dt-input" type="number" min="1" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} placeholder="154" />
                  <span className="hc-field__unit">lbs</span>
                </div>
              </div>
              <div className="hc-field">
                <label className="hc-field__label">Height (ft)</label>
                <div className="hc-field__input-wrap">
                  <input className="dt-input" type="number" min="1" max="9" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} placeholder="5" />
                  <span className="hc-field__unit">ft</span>
                </div>
              </div>
              <div className="hc-field">
                <label className="hc-field__label">Height (in)</label>
                <div className="hc-field__input-wrap">
                  <input className="dt-input" type="number" min="0" max="11" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} placeholder="9" />
                  <span className="hc-field__unit">in</span>
                </div>
              </div>
            </>
          )}
          <div className="hc-field">
            <label className="hc-field__label">Age</label>
            <div className="hc-field__input-wrap">
              <input className="dt-input" type="number" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} placeholder="30" />
              <span className="hc-field__unit">yrs</span>
            </div>
          </div>
        </div>

        {error && <div style={{ marginTop: "var(--space-2)" }}><Note kind="error">{error}</Note></div>}
        <Button variant="primary" onClick={calculate} style={{ marginTop: "var(--space-3)", width: "100%" }}>
          Calculate BMR
        </Button>
      </Panel>

      {bmr !== null ? (
        <div className="hc-result">
          <div className="hc-result__header">
            <span className="hc-result__title">Basal Metabolic Rate</span>
          </div>
          <div className="hc-result__body">
            <div className="hc-big">
              <span className="hc-big__value" style={{ color: "var(--tk-health, #0D9488)" }}>{Math.round(bmr)}</span>
              <span className="hc-big__unit">kcal / day</span>
            </div>

            <div className="hc-stats">
              <div className="hc-stat">
                <span className="hc-stat__label">Per hour</span>
                <span className="hc-stat__value">{(bmr / 24).toFixed(1)}</span>
                <span className="hc-stat__sub">kcal/hr</span>
              </div>
              <div className="hc-stat">
                <span className="hc-stat__label">Per week</span>
                <span className="hc-stat__value">{Math.round(bmr * 7).toLocaleString()}</span>
                <span className="hc-stat__sub">kcal/week</span>
              </div>
              <div className="hc-stat">
                <span className="hc-stat__label">Formula</span>
                <span className="hc-stat__value" style={{ fontSize: "0.875rem" }}>Mifflin-St Jeor</span>
                <span className="hc-stat__sub">most accurate</span>
              </div>
            </div>

            <p className="hc-desc">
              Your BMR is the number of calories your body burns at complete rest — breathing, circulation and organ function.
              Your actual daily needs will be higher based on your activity level. Use the <strong>Daily Calorie Calculator</strong> to find your TDEE.
            </p>
            <p className="hc-note">
              Calculated with the Mifflin-St Jeor equation, which is more accurate than the older Harris-Benedict formula for most adults.
            </p>
          </div>
        </div>
      ) : (
        <div className="hc-result">
          <div className="hc-empty">
            <span className="hc-empty__icon">🔥</span>
            <span>Fill in your details and click <strong>Calculate BMR</strong>.</span>
          </div>
        </div>
      )}
    </ToolFrame>
  );
}
