import { useState } from "react";
import { Button, Note, Panel, ToolFrame } from "@devtools/ui";
import {
  bodyFatResult, calcBodyFatNavy, findTool,
  ftInToCm, lbsToKg, inToCm,
  type Gender, type UnitSystem,
} from "@devtools/tools-core";
import "./HealthCalc.css";

function BodyFatGauge({ gaugePos, color }: { gaugePos: number; color: string }) {
  return (
    <div className="hc-gauge">
      <div
        className="hc-gauge__bar"
        style={{ background: "linear-gradient(to right,#93C5FD 0%,#4ADE80 25%,#84CC16 40%,#FCD34D 60%,#EF4444 100%)" }}
      >
        <div className="hc-gauge__marker" style={{ left: `${gaugePos}%`, borderColor: color }} />
      </div>
      <div className="hc-gauge__ticks">
        <span className="hc-gauge__tick">0%</span>
        <span className="hc-gauge__tick">15%</span>
        <span className="hc-gauge__tick">25%</span>
        <span className="hc-gauge__tick">35%</span>
        <span className="hc-gauge__tick">50%</span>
      </div>
    </div>
  );
}

export default function BodyFatCalculator() {
  const route = findTool("body-fat-calculator");
  const [units, setUnits]   = useState<UnitSystem>("metric");
  const [gender, setGender] = useState<Gender>("male");
  const [weightKg, setWeightKg]   = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [heightCm, setHeightCm]   = useState("");
  const [heightFt, setHeightFt]   = useState("");
  const [heightIn, setHeightIn]   = useState("");
  const [waist, setWaist] = useState("");
  const [neck, setNeck]   = useState("");
  const [hip, setHip]     = useState("");
  const [result, setResult] = useState<ReturnType<typeof bodyFatResult> | null>(null);
  const [error, setError]   = useState<string | null>(null);

  function toCm(val: string) {
    const n = parseFloat(val);
    return units === "metric" ? n : inToCm(n);
  }

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
    const waistCm = toCm(waist);
    const neckCm  = toCm(neck);
    const hipCm   = toCm(hip);

    if (!isFinite(wKg)     || wKg     <= 0) { setError("Enter a valid weight."); return; }
    if (!isFinite(hCm)     || hCm     <= 0) { setError("Enter a valid height."); return; }
    if (!isFinite(waistCm) || waistCm <= 0) { setError("Enter your waist measurement."); return; }
    if (!isFinite(neckCm)  || neckCm  <= 0) { setError("Enter your neck measurement."); return; }
    if (gender === "female" && (!isFinite(hipCm) || hipCm <= 0)) { setError("Enter your hip measurement (required for women)."); return; }
    if (neckCm >= waistCm) { setError("Waist must be larger than neck circumference."); return; }

    const pct = calcBodyFatNavy(gender, hCm, waistCm, neckCm, gender === "female" ? hipCm : undefined);
    if (!isFinite(pct) || pct < 0) { setError("Could not calculate — please check your measurements."); return; }
    setResult(bodyFatResult(gender, wKg, pct));
  }

  const u = units === "metric" ? "cm" : "in";

  return (
    <ToolFrame title={route?.name ?? "Body Fat Calculator"} tagline={route?.tagline ?? ""}>
      <Panel title="Your measurements">
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

        <div className="hc-grid hc-grid--3" style={{ marginTop: "var(--space-3)" }}>
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
          <div className="hc-field">
            <label className="hc-field__label">Waist (at navel)</label>
            <div className="hc-field__input-wrap"><input className="dt-input" type="number" min="1" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder={units === "metric" ? "80" : "31.5"} /><span className="hc-field__unit">{u}</span></div>
          </div>
          <div className="hc-field">
            <label className="hc-field__label">Neck</label>
            <div className="hc-field__input-wrap"><input className="dt-input" type="number" min="1" value={neck} onChange={(e) => setNeck(e.target.value)} placeholder={units === "metric" ? "38" : "15"} /><span className="hc-field__unit">{u}</span></div>
          </div>
          {gender === "female" && (
            <div className="hc-field">
              <label className="hc-field__label">Hip (widest)</label>
              <div className="hc-field__input-wrap"><input className="dt-input" type="number" min="1" value={hip} onChange={(e) => setHip(e.target.value)} placeholder={units === "metric" ? "95" : "37"} /><span className="hc-field__unit">{u}</span></div>
            </div>
          )}
        </div>

        {error && <div style={{ marginTop: "var(--space-2)" }}><Note kind="error">{error}</Note></div>}
        <Button variant="primary" onClick={calculate} style={{ marginTop: "var(--space-3)", width: "100%" }}>
          Calculate Body Fat
        </Button>
      </Panel>

      {result ? (
        <div className="hc-result">
          <div className="hc-result__header"><span className="hc-result__title">Body Fat Result</span></div>
          <div className="hc-result__body">
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
              <div>
                <div className="hc-big">
                  <span className="hc-big__value" style={{ color: result.color }}>{result.percent.toFixed(1)}</span>
                  <span className="hc-big__unit">%</span>
                </div>
                <div className="hc-badge" style={{ background: result.color, marginTop: "0.5rem" }}>{result.category}</div>
              </div>
              <div className="hc-stats" style={{ flex: "1 1 16rem" }}>
                <div className="hc-stat">
                  <span className="hc-stat__label">Fat mass</span>
                  <span className="hc-stat__value">{result.fatMassKg.toFixed(1)}</span>
                  <span className="hc-stat__sub">kg</span>
                </div>
                <div className="hc-stat">
                  <span className="hc-stat__label">Lean mass</span>
                  <span className="hc-stat__value">{result.leanMassKg.toFixed(1)}</span>
                  <span className="hc-stat__sub">kg</span>
                </div>
              </div>
            </div>
            <BodyFatGauge gaugePos={result.gaugePos} color={result.color} />
            <p className="hc-note">
              US Navy circumference method. Accuracy is ±3–4% compared with DEXA. Measure at the same time of day for consistent results.
            </p>
          </div>
        </div>
      ) : (
        <div className="hc-result"><div className="hc-empty"><span className="hc-empty__icon">💪</span><span>Enter your measurements and click <strong>Calculate Body Fat</strong>.</span></div></div>
      )}
    </ToolFrame>
  );
}
