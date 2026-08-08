import type { Annotation, TextAnnotation, WhiteoutAnnotation } from "@devtools/tools-core";
import { COLORS } from "./constants.js";
import { baseFontFamily, composeStandardFont, FONT_FAMILY_OPTIONS, isBoldStandardFont, isItalicStandardFont, type FontFamilyBase } from "./fontMatch.js";

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 30, 36, 48];
const BACKGROUND_COLORS = ["#FFFFFF", ...COLORS];

/**
 * Text-specific controls inside the floating per-element toolbar (see
 * ElementToolbar.tsx) — font family, size, Bold/Italic, and text color,
 * matching what Sejda's own text toolbar offers beyond duplicate/delete.
 * When `cover` is set (this text came from the existing-text patch pipeline,
 * design doc §3), also exposes the paired whiteout's background color —
 * previously that was auto-sampled once and then stuck, with no way to
 * adjust it if the sample guessed wrong.
 *
 * Bold/Italic and family are all folded into `fontFamily` (one of pdf-lib's
 * 12 text standard fonts) rather than the annotation's separate `bold`/
 * `italic` booleans: `flattenAnnotations` resolves the exported font purely
 * from `fontFamily` (see `getFont` in pdf-edit.ts) and ignores those
 * booleans entirely, so writing to them here would look right on screen but
 * silently not export — `fontFamily` is the one field that's both visually
 * and structurally correct.
 */
export function TextToolbarControls({
  annotation,
  cover,
  onUpdate,
}: {
  annotation: TextAnnotation;
  cover: WhiteoutAnnotation | undefined;
  onUpdate: (id: string, patch: Partial<Annotation>) => void;
}) {
  const family = annotation.fontFamily ? baseFontFamily(annotation.fontFamily) : "Helvetica";
  const bold = annotation.fontFamily ? isBoldStandardFont(annotation.fontFamily) : (annotation.bold ?? false);
  const italic = annotation.fontFamily ? isItalicStandardFont(annotation.fontFamily) : (annotation.italic ?? false);

  function setStyle(patch: { family?: FontFamilyBase; bold?: boolean; italic?: boolean }) {
    onUpdate(annotation.id, {
      fontFamily: composeStandardFont(patch.family ?? family, patch.bold ?? bold, patch.italic ?? italic),
    });
  }

  return (
    <>
      <select
        className="pdfed__select pdfed__select--sm"
        value={family}
        onPointerDown={(e) => e.stopPropagation()}
        onChange={(e) => setStyle({ family: e.target.value as FontFamilyBase })}
        aria-label="Font family"
      >
        {FONT_FAMILY_OPTIONS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
      <select
        className="pdfed__select pdfed__select--sm"
        value={annotation.fontSize}
        onPointerDown={(e) => e.stopPropagation()}
        onChange={(e) => onUpdate(annotation.id, { fontSize: Number(e.target.value) })}
        aria-label="Font size"
      >
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        type="button"
        className={`pdfed__element-toolbar-btn${bold ? " pdfed__element-toolbar-btn--active" : ""}`}
        onClick={() => setStyle({ bold: !bold })}
        title="Bold"
        aria-label="Bold"
        aria-pressed={bold}
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        className={`pdfed__element-toolbar-btn${italic ? " pdfed__element-toolbar-btn--active" : ""}`}
        onClick={() => setStyle({ italic: !italic })}
        title="Italic"
        aria-label="Italic"
        aria-pressed={italic}
      >
        <em>I</em>
      </button>
      <span className="pdfed__element-toolbar-swatches" role="group" aria-label="Text color">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={`pdfed__swatch pdfed__swatch--xs${annotation.color === c ? " pdfed__swatch--active" : ""}`}
            style={{ background: c }}
            onClick={() => onUpdate(annotation.id, { color: c })}
            title={`Text color ${c}`}
            aria-label={`Text color ${c}`}
            aria-pressed={annotation.color === c}
          />
        ))}
      </span>
      {cover && (
        <span className="pdfed__element-toolbar-swatches" role="group" aria-label="Background color">
          {BACKGROUND_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`pdfed__swatch pdfed__swatch--xs pdfed__swatch--bg${(cover.color ?? "#FFFFFF") === c ? " pdfed__swatch--active" : ""}`}
              style={{ background: c }}
              onClick={() => onUpdate(cover.id, { color: c })}
              title={`Background color ${c}`}
              aria-label={`Background color ${c}`}
              aria-pressed={(cover.color ?? "#FFFFFF") === c}
            />
          ))}
        </span>
      )}
    </>
  );
}
