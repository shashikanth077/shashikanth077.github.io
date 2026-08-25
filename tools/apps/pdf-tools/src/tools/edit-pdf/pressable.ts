import type { MouseEvent as ReactMouseEvent } from "react";

/**
 * Props for a toolbar `<button>` whose action must fire on mouse *press*,
 * not on the browser's `click` — used by every plain button inside the
 * floating per-element toolbar (Bold/Italic/color swatches/Duplicate/
 * Delete; see TextToolbarControls.tsx and ElementToolbar.tsx).
 *
 * Why: clicking one of these while a text annotation's `<input>` is still
 * focused (mid-edit) lets the browser's normal focus-follows-click give the
 * button focus, blurring the input *before* `click` fires. That blur closes
 * the edit session (TextAnnotationView's `onBlur`), which can reflow this
 * toolbar's position between mousedown and mouseup and land the eventual
 * `click` on nothing — the style silently never applies, and editing closes
 * for no reason the user asked for. Running the action on `mousedown`
 * itself (after `preventDefault()`, which cancels only the focus shift)
 * closes that race for good: the action always applies before any reflow
 * can happen, and the input keeps focus so an active edit session stays
 * open, matching Sejda's own toolbar.
 *
 * Mouse clicks always carry `MouseEvent.detail >= 1`; a `click` triggered by
 * keyboard activation (Space/Enter on a focused button) carries `detail ===
 * 0` — that's what the `onClick` fallback below checks, so keyboard users
 * still get the same action without mouse users ever double-firing it.
 */
export function pressProps(onActivate: () => void) {
  return {
    onMouseDown: (e: ReactMouseEvent) => {
      e.preventDefault();
      onActivate();
    },
    onClick: (e: ReactMouseEvent) => {
      if (e.detail === 0) onActivate();
    },
  };
}
