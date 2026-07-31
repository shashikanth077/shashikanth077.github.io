import { useState } from "react";
import { Button, Note, Panel, ToolFrame } from "@devtools/ui";
import { calcWhtr, whtResult, findTool, inToCm, type UnitSystem } from "@devtools/tools-core";
import "./HealthCalc.css";

function WhtrGauge({ gaugePos, color }: { gaugePos: number; color: string }) {
  return (
    <div className="hc-gauge">
      <div
        className="hc-gauge__bar"
        style={{ background: "linear-gradient(to right,#93C5FD 0%,#93C5FD 23%,#4ADE80 23%,#4ADE80 43%,#84CC16 43%,#84CC16 66%,#FCD34D 66%,#FCD34D 80%,#EF4444 80%,#EF4444 100%)" }}
      >
        <div className="hc-gauge__marker" style={{ left: `${gaugePos}%`, borderColor: color }} />
      </div>
      <div className="hc-gauge__ticks">
        <span className="hc-gauge__tick">0.2</span>
        <span className="hc-gauge__tick">0.34</span>
        <span className="hc-gauge__tick">0.43</span>
        <span className="hc-gauge__tick">0.53</span>
        <span className="hc-gauge__tick">0.58</span>
        <span className="hc-gauge__tick">0.8</span>
      </div>
    </div>
  );
}

const ZONE_INFO = [
  { risk: "very-low",  label: "Very low",   range: "< 0.34", color: "#93C5FD", desc: "Below typical healthy range" },
  { risk: "low",       label: "Low",         range: "0.34–0.42", color: "#4ADE80", desc: "Below healthy range" },
  { risk: "healthy",   label: "Healthy",     range: "0.43–0.52", color: "#84CC16", desc: "Optimal zone" },
  { risk: "overweight",label: "Overweight",  range: "0.53–0.57", color: "#FCD34D", desc: "Increased risk" },
  { risk: "obese",     label: "Obese",       range: "≥ 0.58",    color: "#EF4444", desc: "High risk" },
];

export default function WaistHeightCalculator() {
  const route = findTool("waist-height-ratio-calculator");
  const [units, setUnits] = useState<UnitSystem>("metric");
  const [waist, setWaist] = useState("");
  const [height, setHeight] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [result, setResult] = useState<ReturnType<typeof whtResult> | null>(null);
  const [error, setError]   = useState<string | null>(null);

  function toCm(val: string) {
    return units === "metric" ? parseFloat(val) : inToCm(parseFloat(val));
  }

  function calculate() {
    setError(null);
    const waistCm = toCm(waist);
    let heightCm: number;
    if (units === "metric") heightCm = parseFloat(height);
    else heightCm = parseFloat(heightFt) * 30.48 + parseFloat(heightIn || "0") * 2.54;

    if (!isFinite(waistCm)  || waistCm  <= 0) { setError("Enter your waist measurement."); return; }
    if (!isFinite(heightCm) || heightCm <= 0) { setError("Enter your height."); return; }
    setResult(whtResult(calcWhtr(waistCm, heightCm)));
  }

  const u = units === "metric" ? "cm" : "in";

  return (
    <ToolFrame title={route?.name ?? "Waist-to-Height Ratio Calculator"} tagline={route?.tagline ?? ""}>
      <Panel title="Your measurements">
        <div className="hc-top-row">
          <span className="hc-field__label">Unit system</span>
          <div className="hc-unit-toggle">
            <button className={`hc-unit-toggle__btn${units === "metric" ? " hc-unit-toggle__btn--active" : ""}`} onClick={() => setUnits("metric")}>Metric</button>
            <button className={`hc-unit-toggle__btn${units === "imperial" ? " hc-unit-toggle__btn--active" : ""}`} onClick={() => setUnits("imperial")}>Imperial</button>
          </div>
        </div>

        <div className="hc-grid" style={{ marginTop: "var(--space-3)" }}>
          <div className="hc-field">
            <label className="hc-field__label">Waist circumference</label>
            <div className="hc-field__input-wrap">
              <input className="dt-input" type="number" min="1" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder={units === "metric" ? "80" : "31.5"} />
              <span className="hc-field__unit">{u}</span>
            </div>
          </div>
          {units === "metric" ? (
            <div className="hc-field">
              <label className="hc-field__label">Height</label>
              <div className="hc-field__input-wrap">
                <input className="dt-input" type="number" min="50" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" />
                <span className="hc-field__unit">cm</span>
              </div>
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
          )}
        </div>

        {error && <div style={{ marginTop: "var(--space-2)" }}><Note kind="error">{error}</Note></div>}
        <Button variant="primary" onClick={calculate} style={{ marginTop: "var(--space-3)", width: "100%" }}>
          Calculate WHtR
        </Button>
      </Panel>

      {result ? (
        <div className="hc-result">
          <div className="hc-result__header"><span className="hc-result__title">Waist-to-Height Ratio</span></div>
          <div className="hc-result__body">
            <div>
              <div className="hc-big">
                <span className="hc-big__value" style={{ color: result.color }}>{result.ratio.toFixed(3)}</span>
              </div>
              <div className="hc-badge" style={{ background: result.color, marginTop: "0.5rem" }}>{result.label}</div>
            </div>
            <WhtrGauge gaugePos={result.gaugePos} color={result.color} />
            <div className="hc-stats">
              {ZONE_INFO.map((z) => (
                <div key={z.risk} className="hc-stat" style={result.risk === z.risk ? { borderColor: z.color, background: z.color + "18" } : {}}>
                  <span className="hc-stat__label">{z.label}</span>
                  <span className="hc-stat__value" style={{ color: z.color, fontSize: "0.875rem" }}>{z.range}</span>
                  <span className="hc-stat__sub">{z.desc}</span>
                </div>
              ))}
            </div>
            <p className="hc-note">
              "Keep your waist to less than half your height." A WHtR under 0.5 is the commonly cited healthy target, consistent across ethnicities and ages.
            </p>
          </div>
        </div>
      ) : (
        <div className="hc-result"><div className="hc-empty"><span className="hc-empty__icon">📐</span><span>Enter your waist and height and click <strong>Calculate WHtR</strong>.</span></div></div>
      )}
    </ToolFrame>
  );
}
