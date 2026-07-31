import { useState } from "react";
import { Button, Note, Panel, ToolFrame } from "@devtools/ui";
import {
  calcWhr, whrResult, findTool, inToCm,
  type Gender, type UnitSystem,
} from "@devtools/tools-core";
import "./HealthCalc.css";

function WhrGauge({ gaugePos, color }: { gaugePos: number; color: string }) {
  return (
    <div className="hc-gauge">
      <div
        className="hc-gauge__bar"
        style={{ background: "linear-gradient(to right,#4ADE80 0%,#4ADE80 35%,#FCD34D 35%,#FCD34D 60%,#EF4444 60%,#EF4444 100%)" }}
      >
        <div className="hc-gauge__marker" style={{ left: `${gaugePos}%`, borderColor: color }} />
      </div>
      <div className="hc-gauge__ticks">
        <span className="hc-gauge__tick">0.6</span>
        <span className="hc-gauge__tick">0.85</span>
        <span className="hc-gauge__tick">1.0</span>
        <span className="hc-gauge__tick">1.3</span>
      </div>
    </div>
  );
}

export default function WaistHipCalculator() {
  const route = findTool("waist-hip-ratio-calculator");
  const [units, setUnits]   = useState<UnitSystem>("metric");
  const [gender, setGender] = useState<Gender>("male");
  const [waist, setWaist]   = useState("");
  const [hip, setHip]       = useState("");
  const [result, setResult] = useState<ReturnType<typeof whrResult> | null>(null);
  const [error, setError]   = useState<string | null>(null);

  function toCm(val: string) {
    const n = parseFloat(val);
    return units === "metric" ? n : inToCm(n);
  }

  function calculate() {
    setError(null);
    const waistCm = toCm(waist);
    const hipCm   = toCm(hip);
    if (!isFinite(waistCm) || waistCm <= 0) { setError("Enter your waist measurement."); return; }
    if (!isFinite(hipCm)   || hipCm   <= 0) { setError("Enter your hip measurement."); return; }
    if (waistCm >= hipCm * 2) { setError("Please check your measurements — waist should be smaller than hips."); return; }
    setResult(whrResult(gender, calcWhr(waistCm, hipCm)));
  }

  const u = units === "metric" ? "cm" : "in";

  const riskThresholds = gender === "male"
    ? [{ label: "Low risk", value: "< 0.90", color: "#22C55E" }, { label: "Moderate risk", value: "0.90–0.99", color: "#F59E0B" }, { label: "High risk", value: "≥ 1.00", color: "#EF4444" }]
    : [{ label: "Low risk", value: "< 0.80", color: "#22C55E" }, { label: "Moderate risk", value: "0.80–0.84", color: "#F59E0B" }, { label: "High risk", value: "≥ 0.85", color: "#EF4444" }];

  return (
    <ToolFrame title={route?.name ?? "Waist-to-Hip Ratio Calculator"} tagline={route?.tagline ?? ""}>
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

        <div className="hc-grid" style={{ marginTop: "var(--space-3)" }}>
          <div className="hc-field">
            <label className="hc-field__label">Waist (at navel)</label>
            <div className="hc-field__input-wrap">
              <input className="dt-input" type="number" min="1" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder={units === "metric" ? "80" : "31.5"} />
              <span className="hc-field__unit">{u}</span>
            </div>
          </div>
          <div className="hc-field">
            <label className="hc-field__label">Hip (widest point)</label>
            <div className="hc-field__input-wrap">
              <input className="dt-input" type="number" min="1" value={hip} onChange={(e) => setHip(e.target.value)} placeholder={units === "metric" ? "95" : "37"} />
              <span className="hc-field__unit">{u}</span>
            </div>
          </div>
        </div>

        {error && <div style={{ marginTop: "var(--space-2)" }}><Note kind="error">{error}</Note></div>}
        <Button variant="primary" onClick={calculate} style={{ marginTop: "var(--space-3)", width: "100%" }}>
          Calculate WHR
        </Button>
      </Panel>

      {result ? (
        <div className="hc-result">
          <div className="hc-result__header"><span className="hc-result__title">Waist-to-Hip Ratio</span></div>
          <div className="hc-result__body">
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
              <div>
                <div className="hc-big">
                  <span className="hc-big__value" style={{ color: result.color }}>{result.ratio.toFixed(2)}</span>
                </div>
                <div className="hc-badge" style={{ background: result.color, marginTop: "0.5rem" }}>{result.label}</div>
              </div>
              <div className="hc-stats" style={{ flex: "1 1 16rem" }}>
                {riskThresholds.map((t) => (
                  <div key={t.label} className="hc-stat">
                    <span className="hc-stat__label">{t.label}</span>
                    <span className="hc-stat__value" style={{ color: t.color, fontSize: "0.9375rem" }}>{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <WhrGauge gaugePos={result.gaugePos} color={result.color} />
            <p className="hc-note">
              WHO classification for cardiovascular risk. A "pear" shape (lower WHR) is generally associated with lower health risk than an "apple" shape.
            </p>
          </div>
        </div>
      ) : (
        <div className="hc-result"><div className="hc-empty"><span className="hc-empty__icon">📏</span><span>Enter your waist and hip measurements and click <strong>Calculate WHR</strong>.</span></div></div>
      )}
    </ToolFrame>
  );
}
