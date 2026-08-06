import { useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { RENDER_SCALE, type RenderedPage } from "./geometry.js";

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MIN_BOX_PT = 6;

/** Client-pixel delta -> PDF-point delta, accounting for the page being CSS-scaled down from its native size. */
function screenDeltaToPdfDelta(
  svgEl: SVGSVGElement,
  page: RenderedPage,
  dxClient: number,
  dyClient: number,
): { dx: number; dy: number } {
  const rect = svgEl.getBoundingClientRect();
  const factor = rect.width > 0 ? page.screenWidth / rect.width : 1;
  return {
    dx: (dxClient * factor) / RENDER_SCALE,
    dy: -(dyClient * factor) / RENDER_SCALE, // PDF y grows upward; screen y grows downward
  };
}

export type Corner = "nw" | "ne" | "sw" | "se";

/**
 * Drag-to-move and drag-to-resize for any box-bounded annotation (image,
 * rectangle/ellipse shape, whiteout, link). Renders a "live" override box
 * while the gesture is in progress and commits once, on pointer-up — history
 * gets one undo step per gesture, not one per pixel of movement.
 */
export function useBoxDrag(
  svgRef: RefObject<SVGSVGElement | null>,
  page: RenderedPage,
  box: Box,
  onCommit: (box: Box) => void,
) {
  const [live, setLive] = useState<Box | null>(null);
  const drag = useRef<{
    mode: "move" | "resize";
    corner?: Corner;
    startClientX: number;
    startClientY: number;
    startBox: Box;
  } | null>(null);

  function beginMove(e: ReactPointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    drag.current = { mode: "move", startClientX: e.clientX, startClientY: e.clientY, startBox: box };
  }

  function beginResize(corner: Corner) {
    return (e: ReactPointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      drag.current = { mode: "resize", corner, startClientX: e.clientX, startClientY: e.clientY, startBox: box };
    };
  }

  function onPointerMove(e: ReactPointerEvent) {
    const d = drag.current;
    const svg = svgRef.current;
    if (!d || !svg) return;
    const { dx, dy } = screenDeltaToPdfDelta(svg, page, e.clientX - d.startClientX, e.clientY - d.startClientY);

    if (d.mode === "move") {
      setLive({ ...d.startBox, x: d.startBox.x + dx, y: d.startBox.y + dy });
      return;
    }

    // Resize: anchor the opposite corner, move the dragged corner.
    const { x, y, width, height } = d.startBox;
    let next: Box = { x, y, width, height };
    switch (d.corner) {
      case "se":
        next = { x, y: y + dy, width: width + dx, height: height - dy };
        break;
      case "ne":
        next = { x, y, width: width + dx, height: height + dy };
        break;
      case "sw":
        next = { x: x + dx, y: y + dy, width: width - dx, height: height - dy };
        break;
      case "nw":
        next = { x: x + dx, y, width: width - dx, height: height + dy };
        break;
    }
    setLive(next);
  }

  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const finalBox = live ?? d.startBox;
    setLive(null);
    onCommit(normalizeBox(finalBox));
  }

  return { liveBox: live ?? box, beginMove, beginResize, onPointerMove, onPointerUp };
}

function normalizeBox(box: Box): Box {
  const x = box.width < 0 ? box.x + box.width : box.x;
  const y = box.height < 0 ? box.y + box.height : box.y;
  const width = Math.max(MIN_BOX_PT, Math.abs(box.width));
  const height = Math.max(MIN_BOX_PT, Math.abs(box.height));
  return { x, y, width, height };
}

export interface Point {
  x: number;
  y: number;
}

/** Drag-to-move for a two-endpoint element (line/arrow), one endpoint at a time. */
export function useEndpointDrag(
  svgRef: RefObject<SVGSVGElement | null>,
  page: RenderedPage,
  start: Point,
  end: Point,
  onCommit: (start: Point, end: Point) => void,
) {
  const [live, setLive] = useState<{ start: Point; end: Point } | null>(null);
  const drag = useRef<{
    which: "start" | "end" | "both";
    startClientX: number;
    startClientY: number;
    startPoints: { start: Point; end: Point };
  } | null>(null);

  function begin(which: "start" | "end" | "both") {
    return (e: ReactPointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      drag.current = { which, startClientX: e.clientX, startClientY: e.clientY, startPoints: { start, end } };
    };
  }

  function onPointerMove(e: ReactPointerEvent) {
    const d = drag.current;
    const svg = svgRef.current;
    if (!d || !svg) return;
    const { dx, dy } = screenDeltaToPdfDelta(svg, page, e.clientX - d.startClientX, e.clientY - d.startClientY);

    if (d.which === "both") {
      setLive({
        start: { x: d.startPoints.start.x + dx, y: d.startPoints.start.y + dy },
        end: { x: d.startPoints.end.x + dx, y: d.startPoints.end.y + dy },
      });
    } else if (d.which === "start") {
      setLive({ start: { x: d.startPoints.start.x + dx, y: d.startPoints.start.y + dy }, end: d.startPoints.end });
    } else {
      setLive({ start: d.startPoints.start, end: { x: d.startPoints.end.x + dx, y: d.startPoints.end.y + dy } });
    }
  }

  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const final = live ?? { start, end };
    setLive(null);
    onCommit(final.start, final.end);
  }

  return { live: live ?? { start, end }, begin, onPointerMove, onPointerUp };
}
