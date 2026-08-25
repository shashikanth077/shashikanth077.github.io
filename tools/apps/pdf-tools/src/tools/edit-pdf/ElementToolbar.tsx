import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { DuplicateIcon, TrashIcon } from "./icons.js";
import { pressProps } from "./pressable.js";

export interface ScreenBox {
  sx: number;
  sy: number;
  width: number;
  height: number;
}

const TOOLBAR_HEIGHT_ESTIMATE = 34;
const GAP = 6;

/**
 * Floating per-element toolbar: duplicate/delete (plus whatever type-
 * specific controls are passed as children — see TextToolbarControls),
 * positioned just above the element's screen-space bounding box (below it
 * if there isn't room above). Every box-bounded element type shares this.
 *
 * Text's controls (family/size/Bold/Italic/color/background) can be wide
 * enough to wrap onto a second or third row (see `.pdfed__element-toolbar`'s
 * flex-wrap in EditPdf.css), so a fixed single-row height estimate used to
 * position it *above* the element would put the toolbar's lower rows right
 * on top of the text they belong to — confirmed as a real bug (reported:
 * "toolbar is overlaying on that text"). Measure the toolbar's own actual
 * rendered height after each render and reposition from that instead of a
 * constant, so it's correct however many rows it wraps to.
 *
 * Duplicate/Delete use `pressProps` (see pressable.ts), not a plain
 * `onClick` — see that file for why acting on mousedown instead of click
 * matters here (clicking either while a text annotation is mid-edit would
 * otherwise blur its input first, which can reflow this very toolbar out
 * from under the pointer before the click lands).
 */
export function ElementToolbar({
  box,
  onDuplicate,
  onDelete,
  children,
}: {
  box: ScreenBox;
  onDuplicate?: () => void;
  onDelete: () => void;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(TOOLBAR_HEIGHT_ESTIMATE);

  useLayoutEffect(() => {
    const measured = ref.current?.getBoundingClientRect().height;
    if (measured && Math.abs(measured - height) > 0.5) setHeight(measured);
  });

  const above = box.sy - height - GAP;
  const top = above >= 0 ? above : box.sy + box.height + GAP;

  return (
    <div
      ref={ref}
      className="pdfed__element-toolbar"
      style={{ left: box.sx, top }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      {onDuplicate && (
        <button type="button" className="pdfed__element-toolbar-btn" {...pressProps(onDuplicate)} title="Duplicate" aria-label="Duplicate">
          <DuplicateIcon size={14} />
        </button>
      )}
      <button
        type="button"
        className="pdfed__element-toolbar-btn pdfed__element-toolbar-btn--danger"
        {...pressProps(onDelete)}
        title="Delete"
        aria-label="Delete"
      >
        <TrashIcon size={14} />
      </button>
    </div>
  );
}
