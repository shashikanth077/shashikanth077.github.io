import { useState } from "react";
import { Button, Note, Panel, ToolFrame } from "@devtools/ui";
import {
  calcBmi, calcHealthyWeightRange, findTool,
  ftInToCm, kgToLbs, lbsToKg,
  type UnitSystem,
} from "@devtools/tools-core";
import "./HealthCalc.css";

export default function HealthyWeightCalculator() {
  const route = findTool("healthy-weight-calculator");
  const [units, setUnits]     = useState<UnitSystem>("metric");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightKg, setWeightKg]   = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [hM, setHm]           = useState<number | null>(null);
  const [ranges, setRanges]   = useState<ReturnType<typeof calcHealthyWeightRange> | null>(null);
  const [error, setError]     = useState<string | null>(null);

  function calculate() {
    setError(null);
    let heightM: number;
    if (units === "metric") heightM = parseFloat(heightCm) / 100;
    else heightM = ftInToCm(parseFloat(heightFt) || 0, parseFloat(heightIn) || 0) / 100;
    if (!isFinite(heightM) || heightM < 0.5 || heightM > 3) { setError("Enter a valid height."); return; }
    setHm(heightM);
    setRanges(calcHealthyWeightRange(heightM));
  }

  const currentBmi = hM !== null
    ? (() => {
        const wKg = units === "metric" ? parseFloat(weightKg) : lbsToKg(parseFloat(weightLbs));
        return isFinite(wKg) && wKg > 0 ? calcBmi(wKg, hM) : null;
      })()
    : null;

  const showRange = (minKg: number, maxKg: number) =>
    units === "metric"
      ? `${minKg.toFixed(1)} – ${maxKg.toFixed(1)} kg`
      : `${kgToLbs(minKg).toFixed(1)} – ${kgToLbs(maxKg).toFixed(1)} lbs`;

  return (
    <ToolFrame title={route?.name ?? "Healthy Weight Range Calculator"} tagline={route?.tagline ?? ""}>
      <Panel title="Your height">
        <div className="hc-top-row">
          <span className="hc-field__label">Unit system</span>
          <div className="hc-unit-toggle">
            <button className={`hc-unit-toggle__btn${units === "metric" ? " hc-unit-toggle__btn--active" : ""}`} onClick={() => setUnits("metric")}>Metric</button>
            <button className={`hc-unit-toggle__btn${units === "imperial" ? " hc-unit-toggle__btn--active" : ""}`} onClick={() => setUnits("imperial")}>Imperial</button>
          </div>
        </div>

        <div className="hc-grid" style={{ marginTop: "var(--space-3)" }}>
          {units === "metric" ? (
            <div className="hc-field">
              <label className="hc-field__label">Height</label>
              <div className="hc-field__input-wrap"><input className="dt-input" type="number" min="50" max="280" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="175" /><span className="hc-field__unit">cm</span></div>
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

          <div className="hc-field">
            <label className="hc-field__label">Current weight (optional)</label>
            <div className="hc-field__input-wrap">
              {units === "metric"
                ? <><input className="dt-input" type="number" min="1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="70" /><span className="hc-field__unit">kg</span></>
                : <><input className="dt-input" type="number" min="1" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} placeholder="154" /><span className="hc-field__unit">lbs</span></>}
            </div>
          </div>
        </div>

        {error && <div style={{ marginTop: "var(--space-2)" }}><Note kind="error">{error}</Note></div>}
        <Button variant="primary" onClick={calculate} style={{ marginTop: "var(--space-3)", width: "100%" }}>
          Show Healthy Weight Range
        </Button>
      </Panel>

      {ranges ? (
        <div className="hc-result">
          <div className="hc-result__header"><span className="hc-result__title">Weight Ranges by BMI Category</span></div>
          <div className="hc-result__body">
            {currentBmi !== null && (
              <div className="hc-stats" style={{ marginBottom: 0 }}>
                <div className="hc-stat">
                  <span className="hc-stat__label">Your BMI</span>
                  <span className="hc-stat__value">{currentBmi.toFixed(1)}</span>
                </div>
              </div>
            )}
            <div className="hc-bands">
              {ranges.map((band, i) => (
                <div
                  key={band.label}
                  className={`hc-band${i === 1 ? " hc-band--highlight" : ""}`}
                >
                  <div className="hc-band__dot" style={{ background: band.color }} />
                  <div className="hc-band__label">{band.label}{i === 1 && " ✓"}</div>
                  <div className="hc-band__range">{showRange(band.minKg, band.maxKg)}</div>
                </div>
              ))}
            </div>
            <p className="hc-note">
              Ranges are based on BMI 18.5–24.9 for the healthy band. BMI is a population-level screening tool —
              muscle mass, bone density and other factors mean it's not definitive for every individual.
            </p>
          </div>
        </div>
      ) : (
        <div className="hc-result"><div className="hc-empty"><span className="hc-empty__icon">✅</span><span>Enter your height and click <strong>Show Healthy Weight Range</strong>.</span></div></div>
      )}
    </ToolFrame>
  );
}
