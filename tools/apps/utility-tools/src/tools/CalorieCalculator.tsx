import { useState } from "react";
import { Button, Note, Panel, ToolFrame } from "@devtools/ui";
import {
  ACTIVITY_LEVELS, calcBmr, calcTdee,
  findTool, ftInToCm, lbsToKg,
  type ActivityLevel, type Gender, type UnitSystem,
} from "@devtools/tools-core";
import "./HealthCalc.css";

const GOAL_COLORS: Record<string, string> = {
  "Weight loss (−0.5 kg/wk)":      "#EF4444",
  "Mild loss (−0.25 kg/wk)":       "#F97316",
  "Maintenance":                    "#22C55E",
  "Lean gain (+0.25 kg/wk)":       "#3B82F6",
};

export default function CalorieCalculator() {
  const route = findTool("calorie-calculator");
  const [units, setUnits]       = useState<UnitSystem>("metric");
  const [gender, setGender]     = useState<Gender>("male");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [weightKg, setWeightKg] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [age, setAge]           = useState("");
  const [result, setResult]     = useState<{ bmr: number; tdee: number } | null>(null);
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
    const ageN = parseFloat(age);
    if (!isFinite(wKg) || wKg <= 0)  { setError("Enter a valid weight."); return; }
    if (!isFinite(hCm) || hCm <= 0)  { setError("Enter a valid height."); return; }
    if (!isFinite(ageN) || ageN <= 0) { setError("Enter a valid age."); return; }

    const bmr  = calcBmr(wKg, hCm, ageN, gender);
    const tdee = calcTdee(bmr, activity);
    setResult({ bmr, tdee });
  }

  const goals = result
    ? Object.entries({
        "Weight loss (−0.5 kg/wk)": Math.max(1200, result.tdee - 500),
        "Mild loss (−0.25 kg/wk)":  Math.max(1200, result.tdee - 250),
        "Maintenance":               result.tdee,
        "Lean gain (+0.25 kg/wk)":  result.tdee + 250,
      })
    : [];
  const maxKcal = goals.length ? Math.max(...goals.map(([, v]) => v)) : 1;

  return (
    <ToolFrame title={route?.name ?? "Daily Calorie Calculator"} tagline={route?.tagline ?? ""}>
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
            <label className="hc-field__label">Age</label>
            <div className="hc-field__input-wrap"><input className="dt-input" type="number" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} placeholder="30" /><span className="hc-field__unit">yrs</span></div>
          </div>
        </div>

        <div className="hc-field" style={{ marginTop: "var(--space-3)" }}>
          <label className="hc-field__label">Activity level</label>
          <select className="dt-select hc-activity-select" value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)}>
            {ACTIVITY_LEVELS.map((a) => (
              <option key={a.key} value={a.key}>{a.label} — {a.description}</option>
            ))}
          </select>
        </div>

        {error && <div style={{ marginTop: "var(--space-2)" }}><Note kind="error">{error}</Note></div>}
        <Button variant="primary" onClick={calculate} style={{ marginTop: "var(--space-3)", width: "100%" }}>
          Calculate Calories
        </Button>
      </Panel>

      {result ? (
        <div className="hc-result">
          <div className="hc-result__header">
            <span className="hc-result__title">Daily Calorie Needs</span>
          </div>
          <div className="hc-result__body">
            <div className="hc-stats">
              <div className="hc-stat">
                <span className="hc-stat__label">BMR</span>
                <span className="hc-stat__value">{Math.round(result.bmr).toLocaleString()}</span>
                <span className="hc-stat__sub">kcal at rest</span>
              </div>
              <div className="hc-stat">
                <span className="hc-stat__label">TDEE (Maintenance)</span>
                <span className="hc-stat__value" style={{ color: "var(--tk-health, #0D9488)" }}>{Math.round(result.tdee).toLocaleString()}</span>
                <span className="hc-stat__sub">kcal/day</span>
              </div>
            </div>

            <div className="hc-goals">
              {goals.map(([label, kcal]) => (
                <div key={label} className="hc-goal">
                  <span className="hc-goal__label">{label}</span>
                  <div className="hc-goal__bar-wrap">
                    <div className="hc-goal__bar" style={{ width: `${(kcal / maxKcal) * 100}%`, background: GOAL_COLORS[label] ?? "var(--accent)" }} />
                  </div>
                  <span className="hc-goal__kcal">{Math.round(kcal).toLocaleString()} kcal</span>
                </div>
              ))}
            </div>

            <p className="hc-note">
              TDEE = BMR × activity factor (Mifflin-St Jeor equation). These are estimates — track for 2–4 weeks
              and adjust by 100–200 kcal if your weight doesn't change as expected.
            </p>
          </div>
        </div>
      ) : (
        <div className="hc-result">
          <div className="hc-empty">
            <span className="hc-empty__icon">🥗</span>
            <span>Fill in your details and click <strong>Calculate Calories</strong>.</span>
          </div>
        </div>
      )}
    </ToolFrame>
  );
}
