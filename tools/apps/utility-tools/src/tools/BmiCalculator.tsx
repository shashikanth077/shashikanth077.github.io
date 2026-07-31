import { useState } from "react";
import { Button, Note, Panel, ToolFrame } from "@devtools/ui";
import {
  calcBmi,
  bmiResult,
  findTool,
  ftInToCm,
  lbsToKg,
  type UnitSystem,
} from "@devtools/tools-core";
import "./HealthCalc.css";

function BmiGauge({ gaugePos, color }: { gaugePos: number; color: string }) {
  return (
    <div className="hc-gauge">
      <div
        className="hc-gauge__bar"
        style={{
          background:
            "linear-gradient(to right," +
            "#93C5FD 0%,#93C5FD 24.3%," +
            "#4ADE80 24.3%,#4ADE80 42.9%," +
            "#FCD34D 42.9%,#FCD34D 57.1%," +
            "#FB923C 57.1%,#FB923C 71.4%," +
            "#F87171 71.4%,#F87171 100%)",
        }}
      >
        <div className="hc-gauge__marker" style={{ left: `${gaugePos}%`, borderColor: color }} />
      </div>
      <div className="hc-gauge__ticks">
        <span className="hc-gauge__tick">10</span>
        <span className="hc-gauge__tick">18.5</span>
        <span className="hc-gauge__tick">25</span>
        <span className="hc-gauge__tick">30</span>
        <span className="hc-gauge__tick">35</span>
        <span className="hc-gauge__tick">45</span>
      </div>
      <div className="hc-gauge__zones">
        {(
          [
            ["Underweight", "#93C5FD", 24.3],
            ["Normal",      "#4ADE80", 18.6],
            ["Overweight",  "#FCD34D", 14.2],
            ["Obese I",     "#FB923C", 14.3],
            ["Obese II+",   "#F87171", 28.6],
          ] as const
        ).map(([label, bg, flex]) => (
          <div
            key={label}
            className="hc-gauge__zone"
            style={{ background: bg, flex: `0 0 ${flex}%`, color: label === "Normal" || label === "Underweight" ? "#1e3a2a" : "#fff" }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BmiCalculator() {
  const route = findTool("bmi-calculator");
  const [units, setUnits] = useState<UnitSystem>("metric");

  const [weightKg, setWeightKg]   = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [heightCm, setHeightCm]   = useState("");
  const [heightFt, setHeightFt]   = useState("");
  const [heightIn, setHeightIn]   = useState("");

  const [result, setResult] = useState<ReturnType<typeof bmiResult> | null>(null);
  const [error, setError]   = useState<string | null>(null);

  function calculate() {
    setError(null);
    let wKg: number, hM: number;

    if (units === "metric") {
      wKg = parseFloat(weightKg);
      hM  = parseFloat(heightCm) / 100;
    } else {
      wKg = lbsToKg(parseFloat(weightLbs));
      hM  = ftInToCm(parseFloat(heightFt) || 0, parseFloat(heightIn) || 0) / 100;
    }

    if (!isFinite(wKg) || wKg <= 0) { setError("Enter a valid weight."); return; }
    if (!isFinite(hM)  || hM  <= 0) { setError("Enter a valid height."); return; }
    if (hM > 3)  { setError("Height seems too large — did you forget to use centimetres?"); return; }
    if (wKg > 650) { setError("Weight seems too large."); return; }

    setResult(bmiResult(calcBmi(wKg, hM)));
  }

  return (
    <ToolFrame title={route?.name ?? "BMI Calculator"} tagline={route?.tagline ?? ""}>
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
                <div className="hc-field__input-wrap">
                  <input className="dt-input" type="number" min="1" max="650" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="70" />
                  <span className="hc-field__unit">kg</span>
                </div>
              </div>
              <div className="hc-field">
                <label className="hc-field__label">Height</label>
                <div className="hc-field__input-wrap">
                  <input className="dt-input" type="number" min="50" max="300" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="175" />
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
        </div>

        {error && <div style={{ marginTop: "var(--space-2)" }}><Note kind="error">{error}</Note></div>}
        <Button variant="primary" onClick={calculate} style={{ marginTop: "var(--space-3)", width: "100%" }}>
          Calculate BMI
        </Button>
      </Panel>

      {result ? (
        <div className="hc-result">
          <div className="hc-result__header">
            <span className="hc-result__title">Your Result</span>
          </div>
          <div className="hc-result__body">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-3)" }}>
              <div>
                <div className="hc-big">
                  <span className="hc-big__value" style={{ color: result.color }}>{result.bmi.toFixed(1)}</span>
                  <span className="hc-big__unit">kg/m²</span>
                </div>
                <div className="hc-badge" style={{ background: result.color, marginTop: "0.5rem" }}>
                  {result.label}
                </div>
              </div>

              <div className="hc-stats" style={{ flex: "1 1 18rem" }}>
                <div className="hc-stat">
                  <span className="hc-stat__label">BMI Score</span>
                  <span className="hc-stat__value">{result.bmi.toFixed(2)}</span>
                </div>
                <div className="hc-stat">
                  <span className="hc-stat__label">Category</span>
                  <span className="hc-stat__value" style={{ fontSize: "0.9375rem" }}>{result.label}</span>
                </div>
              </div>
            </div>

            <BmiGauge gaugePos={result.gaugePos} color={result.color} />

            <p className="hc-desc">{result.description}</p>
            <p className="hc-note">
              BMI is a screening tool, not a diagnostic measure. Athletes and older adults may have misleading BMI readings.
              Always consult a healthcare professional for a full assessment.
            </p>
          </div>
        </div>
      ) : (
        <div className="hc-result">
          <div className="hc-empty">
            <span className="hc-empty__icon">⚖️</span>
            <span>Enter your weight and height above, then click <strong>Calculate BMI</strong>.</span>
          </div>
        </div>
      )}
    </ToolFrame>
  );
}
