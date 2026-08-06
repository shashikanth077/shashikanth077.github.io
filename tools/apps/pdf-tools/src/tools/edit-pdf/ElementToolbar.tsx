import type { ReactNode } from "react";
import { DuplicateIcon, TrashIcon } from "./icons.js";

export interface ScreenBox {
  sx: number;
  sy: number;
  width: number;
  height: number;
}

const TOOLBAR_HEIGHT = 34;
const GAP = 6;

/**
 * Floating per-element toolbar: duplicate/delete, positioned just above the
 * element's screen-space bounding box (below it if there isn't room above).
 * Every box-bounded element type shares this — Sejda's own floating toolbar
 * keeps the same move/duplicate/delete icons across text, image, and shape.
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
  const above = box.sy - TOOLBAR_HEIGHT - GAP;
  const top = above >= 0 ? above : box.sy + box.height + GAP;

  return (
    <div
      className="pdfed__element-toolbar"
      style={{ left: box.sx, top }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      {onDuplicate && (
        <button type="button" className="pdfed__element-toolbar-btn" onClick={onDuplicate} title="Duplicate" aria-label="Duplicate">
          <DuplicateIcon size={14} />
        </button>
      )}
      <button
        type="button"
        className="pdfed__element-toolbar-btn pdfed__element-toolbar-btn--danger"
        onClick={onDelete}
        title="Delete"
        aria-label="Delete"
      >
        <TrashIcon size={14} />
      </button>
    </div>
  );
}
