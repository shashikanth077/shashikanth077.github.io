/**
 * Unit conversion — pure, framework-free.
 *
 * Every linear category uses a base unit and per-unit factor: any value in
 * unit U converts to the base by (value * U.factor), and from the base to any
 * target T by (baseValue / T.factor). This keeps the math trivially auditable
 * — every constant is checked against a single-purpose reference table.
 *
 * Temperature is the one non-linear category (has an offset), so its units
 * carry explicit toBase/fromBase functions instead of a factor.
 */

export type UnitCategoryKey =
  | "length"
  | "mass"
  | "temperature"
  | "volume"
  | "area"
  | "time"
  | "speed"
  | "digital"
  | "angle"
  | "energy"
  | "power"
  | "pressure";

export interface Unit {
  /** Stable id used in the URL/state, never displayed. */
  key: string;
  /** Human name, e.g. "Kilometer". */
  label: string;
  /** SI/common symbol, e.g. "km". */
  symbol: string;
  /**
   * How many base units this one unit equals. Linear categories only.
   * Example (length, base=meter): kilometer.factor = 1000, inch.factor = 0.0254.
   */
  factor?: number;
  /** Temperature only: convert this-unit value → base-unit value. */
  toBase?: (value: number) => number;
  /** Temperature only: convert base-unit value → this-unit value. */
  fromBase?: (value: number) => number;
}

export interface UnitCategory {
  key: UnitCategoryKey;
  label: string;
  /** Icon shown in the category selector. */
  icon: string;
  /** key of the base unit — used for internal chaining. */
  baseUnit: string;
  units: Unit[];
}

/* ------------------------------------------------------------------ */
/* Category tables                                                      */
/* ------------------------------------------------------------------ */

const LENGTH: UnitCategory = {
  key: "length",
  label: "Length",
  icon: "📏",
  baseUnit: "meter",
  units: [
    { key: "millimeter", label: "Millimeter", symbol: "mm", factor: 0.001 },
    { key: "centimeter", label: "Centimeter", symbol: "cm", factor: 0.01 },
    { key: "meter", label: "Meter", symbol: "m", factor: 1 },
    { key: "kilometer", label: "Kilometer", symbol: "km", factor: 1000 },
    { key: "inch", label: "Inch", symbol: "in", factor: 0.0254 },
    { key: "foot", label: "Foot", symbol: "ft", factor: 0.3048 },
    { key: "yard", label: "Yard", symbol: "yd", factor: 0.9144 },
    { key: "mile", label: "Mile", symbol: "mi", factor: 1609.344 },
    { key: "nautical-mile", label: "Nautical mile", symbol: "nmi", factor: 1852 },
  ],
};

const MASS: UnitCategory = {
  key: "mass",
  label: "Mass",
  icon: "⚖️",
  baseUnit: "kilogram",
  units: [
    { key: "milligram", label: "Milligram", symbol: "mg", factor: 1e-6 },
    { key: "gram", label: "Gram", symbol: "g", factor: 0.001 },
    { key: "kilogram", label: "Kilogram", symbol: "kg", factor: 1 },
    { key: "metric-ton", label: "Metric ton", symbol: "t", factor: 1000 },
    { key: "ounce", label: "Ounce", symbol: "oz", factor: 0.028349523125 },
    { key: "pound", label: "Pound", symbol: "lb", factor: 0.45359237 },
    { key: "stone", label: "Stone", symbol: "st", factor: 6.35029318 },
    { key: "us-ton", label: "US (short) ton", symbol: "ton", factor: 907.18474 },
  ],
};

// Temperature is non-linear: Fahrenheit = Celsius * 9/5 + 32 has an offset,
// so factors don't compose. Every unit gets explicit toBase/fromBase.
const TEMPERATURE: UnitCategory = {
  key: "temperature",
  label: "Temperature",
  icon: "🌡️",
  baseUnit: "celsius",
  units: [
    {
      key: "celsius",
      label: "Celsius",
      symbol: "°C",
      toBase: (v) => v,
      fromBase: (v) => v,
    },
    {
      key: "fahrenheit",
      label: "Fahrenheit",
      symbol: "°F",
      toBase: (v) => ((v - 32) * 5) / 9,
      fromBase: (v) => (v * 9) / 5 + 32,
    },
    {
      key: "kelvin",
      label: "Kelvin",
      symbol: "K",
      toBase: (v) => v - 273.15,
      fromBase: (v) => v + 273.15,
    },
  ],
};

const VOLUME: UnitCategory = {
  key: "volume",
  label: "Volume",
  icon: "🧴",
  baseUnit: "liter",
  units: [
    { key: "milliliter", label: "Milliliter", symbol: "ml", factor: 0.001 },
    { key: "liter", label: "Liter", symbol: "L", factor: 1 },
    { key: "cubic-meter", label: "Cubic meter", symbol: "m³", factor: 1000 },
    { key: "cubic-inch", label: "Cubic inch", symbol: "in³", factor: 0.016387064 },
    { key: "cubic-foot", label: "Cubic foot", symbol: "ft³", factor: 28.316846592 },
    { key: "us-fluid-ounce", label: "US fluid ounce", symbol: "fl oz", factor: 0.0295735295625 },
    { key: "us-cup", label: "US cup", symbol: "cup", factor: 0.2365882365 },
    { key: "us-pint", label: "US pint", symbol: "pt", factor: 0.473176473 },
    { key: "us-quart", label: "US quart", symbol: "qt", factor: 0.946352946 },
    { key: "us-gallon", label: "US gallon", symbol: "gal", factor: 3.785411784 },
    { key: "imperial-gallon", label: "Imperial gallon", symbol: "gal (UK)", factor: 4.54609 },
  ],
};

const AREA: UnitCategory = {
  key: "area",
  label: "Area",
  icon: "🟦",
  baseUnit: "square-meter",
  units: [
    { key: "square-millimeter", label: "Square millimeter", symbol: "mm²", factor: 1e-6 },
    { key: "square-centimeter", label: "Square centimeter", symbol: "cm²", factor: 1e-4 },
    { key: "square-meter", label: "Square meter", symbol: "m²", factor: 1 },
    { key: "hectare", label: "Hectare", symbol: "ha", factor: 10000 },
    { key: "square-kilometer", label: "Square kilometer", symbol: "km²", factor: 1e6 },
    { key: "square-inch", label: "Square inch", symbol: "in²", factor: 0.00064516 },
    { key: "square-foot", label: "Square foot", symbol: "ft²", factor: 0.09290304 },
    { key: "square-yard", label: "Square yard", symbol: "yd²", factor: 0.83612736 },
    { key: "acre", label: "Acre", symbol: "ac", factor: 4046.8564224 },
    { key: "square-mile", label: "Square mile", symbol: "mi²", factor: 2589988.110336 },
  ],
};

const TIME: UnitCategory = {
  key: "time",
  label: "Time",
  icon: "⏱️",
  baseUnit: "second",
  units: [
    { key: "millisecond", label: "Millisecond", symbol: "ms", factor: 0.001 },
    { key: "second", label: "Second", symbol: "s", factor: 1 },
    { key: "minute", label: "Minute", symbol: "min", factor: 60 },
    { key: "hour", label: "Hour", symbol: "h", factor: 3600 },
    { key: "day", label: "Day", symbol: "d", factor: 86400 },
    { key: "week", label: "Week", symbol: "wk", factor: 604800 },
    // Month uses 30.4375 days (365.25 / 12) — the standard "average month" used
    // by unit converters. Year uses 365.25 (Julian year).
    { key: "month", label: "Month (avg)", symbol: "mo", factor: 2629800 },
    { key: "year", label: "Year (Julian)", symbol: "yr", factor: 31557600 },
  ],
};

const SPEED: UnitCategory = {
  key: "speed",
  label: "Speed",
  icon: "🏎️",
  baseUnit: "meter-per-second",
  units: [
    { key: "meter-per-second", label: "Meter per second", symbol: "m/s", factor: 1 },
    { key: "kilometer-per-hour", label: "Kilometer per hour", symbol: "km/h", factor: 1 / 3.6 },
    { key: "mile-per-hour", label: "Mile per hour", symbol: "mph", factor: 0.44704 },
    { key: "foot-per-second", label: "Foot per second", symbol: "ft/s", factor: 0.3048 },
    { key: "knot", label: "Knot", symbol: "kn", factor: 0.514444444 },
    { key: "mach", label: "Mach (sea-level)", symbol: "M", factor: 340.29 },
  ],
};

// Digital storage: we use the modern IEC convention — KB/MB/GB are decimal
// (1000), KiB/MiB/GiB are binary (1024). Both are commonly asked for.
const DIGITAL: UnitCategory = {
  key: "digital",
  label: "Digital",
  icon: "💾",
  baseUnit: "byte",
  units: [
    { key: "bit", label: "Bit", symbol: "b", factor: 0.125 },
    { key: "byte", label: "Byte", symbol: "B", factor: 1 },
    { key: "kilobyte", label: "Kilobyte (SI)", symbol: "KB", factor: 1000 },
    { key: "megabyte", label: "Megabyte (SI)", symbol: "MB", factor: 1e6 },
    { key: "gigabyte", label: "Gigabyte (SI)", symbol: "GB", factor: 1e9 },
    { key: "terabyte", label: "Terabyte (SI)", symbol: "TB", factor: 1e12 },
    { key: "petabyte", label: "Petabyte (SI)", symbol: "PB", factor: 1e15 },
    { key: "kibibyte", label: "Kibibyte", symbol: "KiB", factor: 1024 },
    { key: "mebibyte", label: "Mebibyte", symbol: "MiB", factor: 1048576 },
    { key: "gibibyte", label: "Gibibyte", symbol: "GiB", factor: 1073741824 },
    { key: "tebibyte", label: "Tebibyte", symbol: "TiB", factor: 1099511627776 },
  ],
};

const ANGLE: UnitCategory = {
  key: "angle",
  label: "Angle",
  icon: "📐",
  baseUnit: "radian",
  units: [
    { key: "radian", label: "Radian", symbol: "rad", factor: 1 },
    { key: "degree", label: "Degree", symbol: "°", factor: Math.PI / 180 },
    { key: "gradian", label: "Gradian", symbol: "gon", factor: Math.PI / 200 },
    { key: "turn", label: "Turn", symbol: "tr", factor: 2 * Math.PI },
    { key: "arcminute", label: "Arcminute", symbol: "′", factor: Math.PI / 10800 },
    { key: "arcsecond", label: "Arcsecond", symbol: "″", factor: Math.PI / 648000 },
  ],
};

const ENERGY: UnitCategory = {
  key: "energy",
  label: "Energy",
  icon: "⚡",
  baseUnit: "joule",
  units: [
    { key: "joule", label: "Joule", symbol: "J", factor: 1 },
    { key: "kilojoule", label: "Kilojoule", symbol: "kJ", factor: 1000 },
    { key: "calorie", label: "Calorie", symbol: "cal", factor: 4.184 },
    { key: "kilocalorie", label: "Kilocalorie", symbol: "kcal", factor: 4184 },
    { key: "watt-hour", label: "Watt-hour", symbol: "Wh", factor: 3600 },
    { key: "kilowatt-hour", label: "Kilowatt-hour", symbol: "kWh", factor: 3.6e6 },
    { key: "electronvolt", label: "Electronvolt", symbol: "eV", factor: 1.602176634e-19 },
    { key: "btu", label: "BTU (IT)", symbol: "BTU", factor: 1055.05585262 },
  ],
};

const POWER: UnitCategory = {
  key: "power",
  label: "Power",
  icon: "🔌",
  baseUnit: "watt",
  units: [
    { key: "watt", label: "Watt", symbol: "W", factor: 1 },
    { key: "kilowatt", label: "Kilowatt", symbol: "kW", factor: 1000 },
    { key: "megawatt", label: "Megawatt", symbol: "MW", factor: 1e6 },
    { key: "milliwatt", label: "Milliwatt", symbol: "mW", factor: 0.001 },
    { key: "horsepower-mechanical", label: "Horsepower (mech)", symbol: "hp", factor: 745.699872 },
    { key: "horsepower-metric", label: "Horsepower (metric)", symbol: "PS", factor: 735.49875 },
    { key: "btu-per-hour", label: "BTU per hour", symbol: "BTU/h", factor: 0.293071 },
  ],
};

const PRESSURE: UnitCategory = {
  key: "pressure",
  label: "Pressure",
  icon: "🎈",
  baseUnit: "pascal",
  units: [
    { key: "pascal", label: "Pascal", symbol: "Pa", factor: 1 },
    { key: "kilopascal", label: "Kilopascal", symbol: "kPa", factor: 1000 },
    { key: "megapascal", label: "Megapascal", symbol: "MPa", factor: 1e6 },
    { key: "bar", label: "Bar", symbol: "bar", factor: 100000 },
    { key: "millibar", label: "Millibar", symbol: "mbar", factor: 100 },
    { key: "atmosphere", label: "Atmosphere", symbol: "atm", factor: 101325 },
    { key: "psi", label: "Pound per square inch", symbol: "psi", factor: 6894.757293168 },
    { key: "torr", label: "Torr", symbol: "Torr", factor: 133.32236842105 },
    { key: "mmhg", label: "Millimeter of mercury", symbol: "mmHg", factor: 133.322387415 },
  ],
};

export const UNIT_CATEGORIES: UnitCategory[] = [
  LENGTH,
  MASS,
  TEMPERATURE,
  VOLUME,
  AREA,
  TIME,
  SPEED,
  DIGITAL,
  ANGLE,
  ENERGY,
  POWER,
  PRESSURE,
];

/* ------------------------------------------------------------------ */
/* Public API                                                           */
/* ------------------------------------------------------------------ */

export function findCategory(key: UnitCategoryKey): UnitCategory | undefined {
  return UNIT_CATEGORIES.find((c) => c.key === key);
}

function findUnit(category: UnitCategory, key: string): Unit | undefined {
  return category.units.find((u) => u.key === key);
}

/**
 * Convert a value from one unit to another within the same category.
 * Returns NaN if either unit key is unknown to the category.
 */
export function convert(
  category: UnitCategory,
  fromKey: string,
  toKey: string,
  value: number,
): number {
  const from = findUnit(category, fromKey);
  const to = findUnit(category, toKey);
  if (!from || !to) return NaN;
  if (!Number.isFinite(value)) return NaN;

  // Non-linear (temperature) — explicit conversion functions.
  if (from.toBase && to.fromBase) {
    const base = from.toBase(value);
    return to.fromBase(base);
  }

  // Linear — factor-based.
  if (from.factor !== undefined && to.factor !== undefined) {
    const base = value * from.factor;
    return base / to.factor;
  }

  // Mixed configuration is a bug in the tables, not a user error.
  return NaN;
}

export interface ConversionRow {
  unit: Unit;
  value: number;
}

/** Converts a single input to every other unit in the category, at once. */
export function convertAll(
  category: UnitCategory,
  fromKey: string,
  value: number,
): ConversionRow[] {
  return category.units.map((unit) => ({
    unit,
    value: convert(category, fromKey, unit.key, value),
  }));
}

/**
 * Format a number for display in the results grid.
 *
 * The dance here handles the awkward extremes: 1e-9 should not display as "0",
 * 1e21 should not display in scientific for anything a user is likely to
 * paste back somewhere. Aim for readable decimal within a reasonable range,
 * fall back to exponential otherwise, and never leave a value as
 * "0.30000000000000004".
 */
export function formatUnitValue(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";

  const abs = Math.abs(value);

  if (abs >= 1e15 || abs < 1e-6) {
    // Use exponential for extremes — 6 significant digits.
    return value.toExponential(6).replace(/\.?0+e/, "e");
  }

  // Choose precision so we show ≥6 significant digits without trailing zero
  // noise. toPrecision then strip trailing zeros and a lonely trailing dot.
  const precise = value.toPrecision(10);
  // Strip trailing zeros in the fractional part; leave integers alone.
  if (precise.includes(".") && !precise.includes("e")) {
    return precise.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  }
  return precise;
}
