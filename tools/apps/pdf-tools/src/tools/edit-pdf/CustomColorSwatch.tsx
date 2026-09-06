/**
 * A "pick any color" swatch that sits at the end of a preset-swatch row
 * (`COLORS`/`HIGHLIGHT_COLORS`/`BACKGROUND_COLORS` in constants.ts) and
 * opens the browser's own native color picker via a visually-hidden
 * `<input type="color">` — see the `.pdfed__hidden-input` convention
 * already used elsewhere in this editor for the same "real input, styled
 * sibling" shape.
 *
 * Deliberately not a custom popover: this editor has exactly one dropdown
 * pattern already (`ToolbarDropdown` in Toolbar.tsx) and building a second,
 * bespoke one just for a color picker would be more code, another set of
 * outside-click/Escape wiring to get right, and a worse picker than every
 * browser already ships. The native control also can't have the "stays
 * open after clicking away" problem a hand-rolled popover would need its
 * own dismissal logic to avoid — the browser owns that entirely.
 *
 * No `pressProps` here (unlike the plain-button swatches beside this one):
 * that helper fires its action on `mousedown` with `preventDefault()`,
 * which would suppress the very focus shift that opens this input's native
 * picker. This is the same, already-established exception the `<select>`s
 * elsewhere in this toolbar get, for the same reason.
 *
 * `isCustom` (the current value isn't one of the row's own presets) drives
 * the active ring, so this swatch doubles as "shows the current color" once
 * a non-preset value is picked, matching how every preset swatch already
 * shows its own selected state.
 */
export function CustomColorSwatch({
  value,
  isCustom,
  onChange,
  label,
  size = "",
}: {
  value: string;
  isCustom: boolean;
  onChange: (hex: string) => void;
  label: string;
  size?: "" | "xs";
}) {
  return (
    <label
      className={`pdfed__swatch pdfed__swatch--custom${size === "xs" ? " pdfed__swatch--xs" : ""}${isCustom ? " pdfed__swatch--active" : ""}`}
      style={isCustom ? { background: value } : undefined}
      title={isCustom ? `Custom color ${value}` : "Pick a custom color…"}
    >
      <input
        type="color"
        className="pdfed__hidden-input"
        value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
        onPointerDown={(e) => e.stopPropagation()}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      />
    </label>
  );
}
