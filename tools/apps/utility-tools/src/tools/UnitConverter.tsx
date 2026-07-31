import { useEffect, useMemo, useState } from "react";
import {
  UNIT_CATEGORIES,
  convertAll,
  findCategory,
  findTool,
  formatUnitValue,
  type UnitCategoryKey,
} from "@devtools/tools-core";
import { Button, CopyButton, Note, Panel, ToolFrame } from "@devtools/ui";
import "./UnitConverter.css";

/**
 * Common presets per category so a first-time visitor sees something sensible.
 * The values map to unit keys defined in libs/tools-core/src/units.ts.
 */
const DEFAULT_UNIT: Record<UnitCategoryKey, string> = {
  length: "meter",
  mass: "kilogram",
  temperature: "celsius",
  volume: "liter",
  area: "square-meter",
  time: "second",
  speed: "kilometer-per-hour",
  digital: "megabyte",
  angle: "degree",
  energy: "joule",
  power: "watt",
  pressure: "pascal",
};

export default function UnitConverter() {
  const route = findTool("unit-converter");
  const [categoryKey, setCategoryKey] = useState<UnitCategoryKey>("length");
  const [fromUnit, setFromUnit] = useState<string>(DEFAULT_UNIT.length);
  const [inputText, setInputText] = useState<string>("1");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const category = findCategory(categoryKey)!;

  // Reset the from-unit when the category changes to something not in the new set.
  useEffect(() => {
    if (!category.units.some((u) => u.key === fromUnit)) {
      setFromUnit(DEFAULT_UNIT[categoryKey]);
    }
  }, [categoryKey, category, fromUnit]);

  // Parse permissively — allow blanks (show 0), scientific notation, and a
  // leading + sign. Reject anything that isn't a finite number.
  const value = useMemo(() => {
    const trimmed = inputText.trim();
    if (trimmed === "" || trimmed === "-" || trimmed === "+" || trimmed === ".") return 0;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : NaN;
  }, [inputText]);

  const hasError = Number.isNaN(value);
  const results = useMemo(() => convertAll(category, fromUnit, hasError ? 0 : value), [
    category,
    fromUnit,
    value,
    hasError,
  ]);

  function swap(toKey: string) {
    // Clicking a result row: make that unit the new input, carry its value over.
    const row = results.find((r) => r.unit.key === toKey);
    if (!row) return;
    setFromUnit(toKey);
    setInputText(formatUnitValue(row.value));
  }

  function copy(key: string, value: string) {
    void navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1200);
    });
  }

  return (
    <ToolFrame title={route?.name ?? "Unit Converter"} tagline={route?.tagline ?? ""}>
      <nav className="uc-cats" aria-label="Unit category">
        {UNIT_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            className={`uc-cat${categoryKey === c.key ? " uc-cat--active" : ""}`}
            onClick={() => setCategoryKey(c.key)}
            aria-pressed={categoryKey === c.key}
          >
            <span className="uc-cat__icon" aria-hidden="true">
              {c.icon}
            </span>
            <span className="uc-cat__label">{c.label}</span>
          </button>
        ))}
      </nav>

      <Panel title="Value to convert">
        <div className="uc-input-row">
          <input
            type="text"
            inputMode="decimal"
            className={`dt-input uc-input${hasError ? " dt-input--invalid" : ""}`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter a number…"
            aria-label={`Value in ${category.units.find((u) => u.key === fromUnit)?.label ?? ""}`}
            autoFocus
          />
          <select
            className="dt-select uc-from-select"
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            aria-label="From unit"
          >
            {category.units.map((u) => (
              <option key={u.key} value={u.key}>
                {u.label} ({u.symbol})
              </option>
            ))}
          </select>
          <Button variant="quiet" onClick={() => setInputText("")}>
            Clear
          </Button>
        </div>
        {hasError && (
          <Note kind="error">That's not a number I can convert — try 42, 3.14 or 1.5e-3.</Note>
        )}
      </Panel>

      <div className="uc-results">
        {results
          .filter((r) => r.unit.key !== fromUnit)
          .map((row) => {
            const formatted = formatUnitValue(row.value);
            return (
              <div key={row.unit.key} className="uc-row">
                <button
                  type="button"
                  className="uc-row__unit"
                  onClick={() => swap(row.unit.key)}
                  title={`Use ${row.unit.label} as input`}
                >
                  <span className="uc-row__label">{row.unit.label}</span>
                  <span className="uc-row__symbol">{row.unit.symbol}</span>
                </button>
                <div className="uc-row__value">
                  <span className="uc-row__number">{formatted}</span>
                  <button
                    type="button"
                    className="uc-row__copy"
                    onClick={() => copy(row.unit.key, formatted)}
                    aria-label={`Copy ${formatted} ${row.unit.symbol}`}
                    title="Copy value"
                  >
                    {copiedKey === row.unit.key ? "Copied ✓" : "Copy"}
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      <p className="uc-hint">
        Tip: click any row to use that unit as your input, or copy just the number to your clipboard.
      </p>

      {/* Copy on the input itself, so users can share their working value */}
      <div style={{ display: "none" }}>
        <CopyButton value={inputText} />
      </div>
    </ToolFrame>
  );
}
