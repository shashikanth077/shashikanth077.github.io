import type { ShapeKind } from "@devtools/tools-core";

export const COLORS = ["#000000", "#E8505B", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"];
export const HIGHLIGHT_COLORS = ["#FEF08A", "#BBF7D0", "#BFDBFE", "#FBCFE8"];
export const HIGHLIGHT_OPACITY = 0.4;
export const DEFAULT_FONT_SIZE = 14;
export const DEFAULT_STROKE_WIDTH = 2;
export const DEFAULT_SHAPE_STROKE_WIDTH = 2;

export const SHAPE_KINDS: Array<{ kind: ShapeKind; label: string }> = [
  { kind: "rectangle", label: "Rectangle" },
  { kind: "ellipse", label: "Ellipse" },
  { kind: "line", label: "Line" },
  { kind: "arrow", label: "Arrow" },
];

/** Minimum on-screen drag distance (px) before a drag-to-create gesture commits an element. */
export const MIN_DRAG_SIZE = 4;
