/* Health calculation functions — all pure, no React imports. */

export type Gender = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very-active";
export type UnitSystem = "metric" | "imperial";

/* ---- unit converters ---- */

export function kgToLbs(kg: number): number { return kg * 2.20462262; }
export function lbsToKg(lbs: number): number { return lbs / 2.20462262; }
export function cmToIn(cm: number): number { return cm / 2.54; }
export function inToCm(inches: number): number { return inches * 2.54; }
export function cmToFtIn(cm: number): { ft: number; in: number } {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inches = Math.round(totalIn % 12);
  return { ft, in: inches };
}
export function ftInToCm(ft: number, inches: number): number {
  return (ft * 12 + inches) * 2.54;
}

/* ---- BMI ---- */

export interface BmiResult {
  bmi: number;
  category: "underweight" | "normal" | "overweight" | "obese-1" | "obese-2" | "obese-3";
  label: string;
  description: string;
  color: string;
  /** 0-100 position on the gauge bar (min=10, max=45) */
  gaugePos: number;
}

export function calcBmi(weightKg: number, heightM: number): number {
  return weightKg / (heightM * heightM);
}

export function bmiResult(bmi: number): BmiResult {
  const gaugePos = Math.max(1, Math.min(99, ((bmi - 10) / 35) * 100));
  if (bmi < 18.5)
    return { bmi, category: "underweight", label: "Underweight", description: "Below healthy range — consider consulting a nutritionist.", color: "#3B82F6", gaugePos };
  if (bmi < 25.0)
    return { bmi, category: "normal", label: "Normal weight", description: "You are within the healthy BMI range.", color: "#22C55E", gaugePos };
  if (bmi < 30.0)
    return { bmi, category: "overweight", label: "Overweight", description: "Slightly above the healthy range. Diet and exercise can help.", color: "#F59E0B", gaugePos };
  if (bmi < 35.0)
    return { bmi, category: "obese-1", label: "Obese (Class I)", description: "Increased health risk. Consider consulting a doctor.", color: "#F97316", gaugePos };
  if (bmi < 40.0)
    return { bmi, category: "obese-2", label: "Obese (Class II)", description: "High health risk. Medical advice is recommended.", color: "#EF4444", gaugePos };
  return { bmi, category: "obese-3", label: "Obese (Class III)", description: "Very high health risk. Please seek medical guidance.", color: "#B91C1C", gaugePos };
}

/* ---- BMR (Mifflin-St Jeor, most accurate for most adults) ---- */

export function calcBmr(weightKg: number, heightCm: number, ageYears: number, gender: Gender): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return gender === "male" ? base + 5 : base - 161;
}

/* ---- TDEE / Daily Calories ---- */

export const ACTIVITY_LEVELS: Array<{ key: ActivityLevel; label: string; description: string; factor: number }> = [
  { key: "sedentary",    label: "Sedentary",        description: "Little or no exercise, desk job",                    factor: 1.2   },
  { key: "light",        label: "Lightly active",   description: "Light exercise 1–3 days/week",                       factor: 1.375 },
  { key: "moderate",     label: "Moderately active", description: "Moderate exercise 3–5 days/week",                   factor: 1.55  },
  { key: "active",       label: "Very active",       description: "Hard exercise 6–7 days/week",                       factor: 1.725 },
  { key: "very-active",  label: "Extra active",      description: "Very hard exercise, physical job or twice-a-day",   factor: 1.9   },
];

export function calcTdee(bmr: number, activity: ActivityLevel): number {
  const level = ACTIVITY_LEVELS.find((a) => a.key === activity);
  return bmr * (level?.factor ?? 1.2);
}

export interface CalorieGoals {
  maintenance: number;
  mildLoss:    number;   // -250 kcal/day → −0.25 kg/week
  loss:        number;   // -500 kcal/day → −0.5 kg/week
  gain:        number;   // +250 kcal/day → +0.25 kg/week
}

export function calorieGoals(tdee: number): CalorieGoals {
  return {
    maintenance: Math.round(tdee),
    mildLoss:    Math.round(tdee - 250),
    loss:        Math.round(tdee - 500),
    gain:        Math.round(tdee + 250),
  };
}

/* ---- Body Fat % (US Navy Method) ---- */

export interface BodyFatResult {
  percent: number;
  fatMassKg: number;
  leanMassKg: number;
  category: string;
  color: string;
  gaugePos: number;
}

export function calcBodyFatNavy(
  gender: Gender,
  heightCm: number,
  waistCm: number,
  neckCm: number,
  hipCm?: number,
): number {
  if (gender === "male") {
    return 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
  }
  const hip = hipCm ?? 0;
  return 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hip - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
}

export function bodyFatResult(gender: Gender, weightKg: number, percent: number): BodyFatResult {
  const fatMassKg = (percent / 100) * weightKg;
  const leanMassKg = weightKg - fatMassKg;
  const gaugePos = Math.max(1, Math.min(99, (percent / 50) * 100));

  const maleRanges: Array<[number, string, string]> = [
    [6,  "Essential fat", "#3B82F6"],
    [14, "Athletic",      "#22C55E"],
    [18, "Fitness",       "#84CC16"],
    [25, "Average",       "#F59E0B"],
    [Infinity, "Obese",   "#EF4444"],
  ];
  const femaleRanges: Array<[number, string, string]> = [
    [14, "Essential fat", "#3B82F6"],
    [21, "Athletic",      "#22C55E"],
    [25, "Fitness",       "#84CC16"],
    [32, "Average",       "#F59E0B"],
    [Infinity, "Obese",   "#EF4444"],
  ];

  const ranges = gender === "male" ? maleRanges : femaleRanges;
  const match = ranges.find(([limit]) => percent < limit);
  const [, category, color] = match ?? [0, "Obese", "#EF4444"];
  return { percent, fatMassKg, leanMassKg, category, color, gaugePos };
}

/* ---- Lean Body Mass ---- */

export interface LbmResult {
  boer: number;   // Boer formula
  james: number;  // James formula
  average: number;
}

export function calcLbm(weightKg: number, heightCm: number, gender: Gender): LbmResult {
  const boer   = gender === "male"
    ? 0.407 * weightKg + 0.267 * heightCm - 19.2
    : 0.252 * weightKg + 0.473 * heightCm - 48.3;
  const james  = gender === "male"
    ? 1.1 * weightKg - 128 * (weightKg / heightCm) ** 2
    : 1.07 * weightKg - 148 * (weightKg / heightCm) ** 2;
  const average = (boer + james) / 2;
  return { boer, james, average };
}

export function calcLbmFromBodyFat(weightKg: number, bodyFatPct: number): number {
  return weightKg * (1 - bodyFatPct / 100);
}

/* ---- Ideal Body Weight ---- */

export interface IdealWeightResult {
  formula: string;
  kg: number;
  lbs: number;
  note: string;
}

export function calcIdealWeight(heightCm: number, gender: Gender): IdealWeightResult[] {
  const heightIn = cmToIn(heightCm);
  const over60   = Math.max(0, heightIn - 60);

  const formulas: Array<{ formula: string; male: number; female: number; note: string }> = [
    { formula: "Hamwi",    male: 48.0 + 2.7  * over60, female: 45.4 + 2.27 * over60, note: "Used by dietitians" },
    { formula: "Devine",   male: 50.0 + 2.3  * over60, female: 45.5 + 2.3  * over60, note: "Common in clinical practice" },
    { formula: "Robinson", male: 52.0 + 1.9  * over60, female: 49.0 + 1.7  * over60, note: "Adjusted Devine" },
    { formula: "Miller",   male: 56.2 + 1.41 * over60, female: 53.1 + 1.36 * over60, note: "Based on NHANES data" },
  ];

  return formulas.map(({ formula, male, female, note }) => {
    const kg = gender === "male" ? male : female;
    return { formula, kg, lbs: kgToLbs(kg), note };
  });
}

/* ---- Waist-to-Hip Ratio ---- */

export interface WhrResult {
  ratio: number;
  risk: "low" | "moderate" | "high";
  label: string;
  color: string;
  gaugePos: number;
}

export function calcWhr(waistCm: number, hipCm: number): number {
  return waistCm / hipCm;
}

export function whrResult(gender: Gender, ratio: number): WhrResult {
  const gaugePos = Math.max(1, Math.min(99, ((ratio - 0.6) / 0.7) * 100));
  if (gender === "male") {
    if (ratio < 0.90) return { ratio, risk: "low",      label: "Low risk",      color: "#22C55E", gaugePos };
    if (ratio < 1.00) return { ratio, risk: "moderate", label: "Moderate risk", color: "#F59E0B", gaugePos };
    return              { ratio, risk: "high",     label: "High risk",     color: "#EF4444", gaugePos };
  }
  if (ratio < 0.80) return { ratio, risk: "low",      label: "Low risk",      color: "#22C55E", gaugePos };
  if (ratio < 0.85) return { ratio, risk: "moderate", label: "Moderate risk", color: "#F59E0B", gaugePos };
  return              { ratio, risk: "high",     label: "High risk",     color: "#EF4444", gaugePos };
}

/* ---- Waist-to-Height Ratio ---- */

export interface WhtResult {
  ratio: number;
  risk: "very-low" | "low" | "healthy" | "overweight" | "obese";
  label: string;
  color: string;
  gaugePos: number;
}

export function calcWhtr(waistCm: number, heightCm: number): number {
  return waistCm / heightCm;
}

export function whtResult(ratio: number): WhtResult {
  const gaugePos = Math.max(1, Math.min(99, ((ratio - 0.2) / 0.6) * 100));
  if (ratio < 0.34) return { ratio, risk: "very-low",   label: "Very low",       color: "#3B82F6", gaugePos };
  if (ratio < 0.43) return { ratio, risk: "low",         label: "Low",            color: "#22C55E", gaugePos };
  if (ratio < 0.53) return { ratio, risk: "healthy",     label: "Healthy",        color: "#84CC16", gaugePos };
  if (ratio < 0.58) return { ratio, risk: "overweight",  label: "Overweight",     color: "#F59E0B", gaugePos };
  return               { ratio, risk: "obese",       label: "Obese",          color: "#EF4444", gaugePos };
}

/* ---- Healthy Weight Range ---- */

export interface WeightRange {
  minKg: number; maxKg: number;
  minLbs: number; maxLbs: number;
  label: string;
  color: string;
}

export function calcHealthyWeightRange(heightM: number): WeightRange[] {
  const zones: Array<{ label: string; minBmi: number; maxBmi: number; color: string }> = [
    { label: "Underweight",   minBmi: 10,   maxBmi: 18.5, color: "#3B82F6" },
    { label: "Normal weight", minBmi: 18.5, maxBmi: 25.0, color: "#22C55E" },
    { label: "Overweight",    minBmi: 25.0, maxBmi: 30.0, color: "#F59E0B" },
    { label: "Obese",         minBmi: 30.0, maxBmi: 40.0, color: "#EF4444" },
  ];
  const h2 = heightM * heightM;
  return zones.map(({ label, minBmi, maxBmi, color }) => ({
    label,
    minKg:  +(minBmi * h2).toFixed(1),
    maxKg:  +(maxBmi * h2).toFixed(1),
    minLbs: +(kgToLbs(minBmi * h2)).toFixed(1),
    maxLbs: +(kgToLbs(maxBmi * h2)).toFixed(1),
    color,
  }));
}

/* ---- Body Surface Area ---- */

export interface BsaResult {
  mosteller: number;  // m²
  dubois: number;
  haycock: number;
  average: number;
}

export function calcBsa(weightKg: number, heightCm: number): BsaResult {
  const mosteller = Math.sqrt((heightCm * weightKg) / 3600);
  const dubois    = 0.007184 * Math.pow(heightCm, 0.725) * Math.pow(weightKg, 0.425);
  const haycock   = 0.024265 * Math.pow(heightCm, 0.3964) * Math.pow(weightKg, 0.5378);
  const average   = (mosteller + dubois + haycock) / 3;
  return { mosteller, dubois, haycock, average };
}

/* ---- Shared formatting helpers ---- */

export function fmt1(n: number): string { return n.toFixed(1); }
export function fmt2(n: number): string { return n.toFixed(2); }
