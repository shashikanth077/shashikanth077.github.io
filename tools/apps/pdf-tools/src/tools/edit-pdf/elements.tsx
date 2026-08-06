import { useEffect, useMemo, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import type {
  Annotation,
  FormFieldAnnotation,
  HighlightAnnotation,
  ImageAnnotation,
  LinkAnnotation,
  MarkupAnnotation,
  PenAnnotation,
  ShapeAnnotation,
  SignatureAnnotation,
  TextAnnotation,
  WhiteoutAnnotation,
} from "@devtools/tools-core";
import { boxToScreen, pdfToScreen, RENDER_SCALE, type RenderedPage } from "./geometry.js";
import { useBoxDrag, useEndpointDrag, type Box, type Corner } from "./interactions.js";
import type { ScreenBox } from "./ElementToolbar.js";

/* ------------------------------------------------------------------ */
/* Shared props                                                        */
/* ------------------------------------------------------------------ */

export interface AnnotationViewProps {
  annotation: Annotation;
  page: RenderedPage;
  svgRef: RefObject<SVGSVGElement | null>;
  selected: boolean;
  editing: boolean;
  onSelect: (id: string) => void;
  onStartEditingText: (id: string) => void;
  onStopEditingText: () => void;
  onUpdate: (id: string, patch: Partial<Annotation>) => void;
}

/* ------------------------------------------------------------------ */
/* Dispatcher                                                           */
/* ------------------------------------------------------------------ */

export function AnnotationView(props: AnnotationViewProps) {
  const { annotation } = props;

  switch (annotation.type) {
    case "text":
      return <TextAnnotationView {...props} annotation={annotation} />;
    case "pen":
      return <PenAnnotationView {...props} annotation={annotation} />;
    case "highlight":
      return <HighlightAnnotationView {...props} annotation={annotation} />;
    case "image":
      return <ImageAnnotationView {...props} annotation={annotation} />;
    case "shape":
      return <ShapeAnnotationView {...props} annotation={annotation} />;
    case "link":
      return <LinkAnnotationView {...props} annotation={annotation} />;
    case "whiteout":
      return <WhiteoutAnnotationView {...props} annotation={annotation} />;
    case "signature":
      return <SignatureAnnotationView {...props} annotation={annotation} />;
    case "strikeout":
    case "underline":
      return <MarkupAnnotationView {...props} annotation={annotation} />;
    case "form-field":
      return <FormFieldAnnotationView {...props} annotation={annotation} />;
  }
}

/**
 * Screen-space bounding box of any annotation, used by the page orchestrator
 * to position the single floating per-element toolbar (see EditPdf.tsx /
 * ElementToolbar.tsx) — computed once, centrally, instead of duplicating a
 * position inside every element renderer.
 */
export function getAnnotationScreenBox(page: RenderedPage, annotation: Annotation): ScreenBox {
  switch (annotation.type) {
    case "text": {
      const screen = pdfToScreen(page, annotation.x, annotation.y);
      const displayFontSize = annotation.fontSize * RENDER_SCALE;
      const width = Math.max(60, (annotation.text.length || 8) * displayFontSize * 0.55 + 12);
      const height = displayFontSize * 1.4 + 6;
      return { sx: screen.sx - 4, sy: screen.sy - 2, width, height };
    }
    case "pen": {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const p of annotation.points) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
      const topLeft = pdfToScreen(page, minX, maxY);
      return { sx: topLeft.sx - 4, sy: topLeft.sy - 4, width: (maxX - minX) * RENDER_SCALE + 8, height: (maxY - minY) * RENDER_SCALE + 8 };
    }
    case "shape": {
      if (annotation.kind === "line" || annotation.kind === "arrow") {
        const s1 = pdfToScreen(page, annotation.x, annotation.y);
        const s2 = pdfToScreen(page, annotation.x + annotation.width, annotation.y + annotation.height);
        return { sx: Math.min(s1.sx, s2.sx), sy: Math.min(s1.sy, s2.sy), width: Math.abs(s2.sx - s1.sx), height: Math.abs(s2.sy - s1.sy) };
      }
      return boxToScreen(page, annotation);
    }
    default:
      return boxToScreen(page, annotation as Annotation & Box);
  }
}

/* ------------------------------------------------------------------ */
/* Resize handles — shared by every box-bounded element                */
/* ------------------------------------------------------------------ */

function ResizeHandles({
  screenBox,
  onBeginResize,
}: {
  screenBox: ScreenBox;
  onBeginResize: (corner: Corner) => (e: ReactPointerEvent) => void;
}) {
  const corners: Array<{ id: Corner; cx: number; cy: number; cursor: string }> = [
    { id: "nw", cx: screenBox.sx, cy: screenBox.sy, cursor: "nwse-resize" },
    { id: "ne", cx: screenBox.sx + screenBox.width, cy: screenBox.sy, cursor: "nesw-resize" },
    { id: "sw", cx: screenBox.sx, cy: screenBox.sy + screenBox.height, cursor: "nesw-resize" },
    { id: "se", cx: screenBox.sx + screenBox.width, cy: screenBox.sy + screenBox.height, cursor: "nwse-resize" },
  ];
  return (
    <>
      {corners.map((c) => (
        <circle key={c.id} cx={c.cx} cy={c.cy} r={5} className="pdfed__handle" style={{ cursor: c.cursor }} onPointerDown={onBeginResize(c.id)} />
      ))}
    </>
  );
}

function SelectionOutline({ screenBox }: { screenBox: ScreenBox }) {
  return (
    <rect
      x={screenBox.sx}
      y={screenBox.sy}
      width={screenBox.width}
      height={screenBox.height}
      fill="none"
      stroke="var(--accent)"
      strokeWidth={1.5}
      strokeDasharray="4 3"
      pointerEvents="none"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Box-bounded element hook — shared plumbing for image/shape/link/whiteout */
/* ------------------------------------------------------------------ */

function useBoxAnnotation<T extends Annotation & Box>(props: AnnotationViewProps, annotation: T) {
  const box: Box = { x: annotation.x, y: annotation.y, width: annotation.width, height: annotation.height };
  const { liveBox, beginMove, beginResize, onPointerMove, onPointerUp } = useBoxDrag(props.svgRef, props.page, box, (next) =>
    props.onUpdate(annotation.id, next as Partial<Annotation>),
  );
  const screenBox = boxToScreen(props.page, liveBox);
  return { screenBox, beginMove, beginResize, onPointerMove, onPointerUp };
}

/* ------------------------------------------------------------------ */
/* Image                                                                */
/* ------------------------------------------------------------------ */

function ImageAnnotationView(props: AnnotationViewProps & { annotation: ImageAnnotation }) {
  const { annotation, selected, onSelect } = props;
  const { screenBox, beginMove, beginResize, onPointerMove, onPointerUp } = useBoxAnnotation(props, annotation);

  return (
    <g data-annotation-id={annotation.id}>
      <image
        href={annotation.dataUrl}
        x={screenBox.sx}
        y={screenBox.sy}
        width={screenBox.width}
        height={screenBox.height}
        preserveAspectRatio="none"
        style={{ cursor: "move" }}
        onPointerDown={(e) => {
          onSelect(annotation.id);
          beginMove(e);
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      {selected && (
        <>
          <SelectionOutline screenBox={screenBox} />
          <ResizeHandles screenBox={screenBox} onBeginResize={beginResize} />
        </>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Signature — visually an image, kept as its own type (see pdf-edit.ts) */
/* so the Sign dropdown's "recent signatures" list and flatten draw     */
/* order can treat it distinctly from a plain inserted image.           */
/* ------------------------------------------------------------------ */

function SignatureAnnotationView(props: AnnotationViewProps & { annotation: SignatureAnnotation }) {
  const { annotation, selected, onSelect } = props;
  const { screenBox, beginMove, beginResize, onPointerMove, onPointerUp } = useBoxAnnotation(props, annotation);

  return (
    <g data-annotation-id={annotation.id}>
      <image
        href={annotation.dataUrl}
        x={screenBox.sx}
        y={screenBox.sy}
        width={screenBox.width}
        height={screenBox.height}
        preserveAspectRatio="xMidYMid meet"
        style={{ cursor: "move" }}
        onPointerDown={(e) => {
          onSelect(annotation.id);
          beginMove(e);
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      {selected && (
        <>
          <SelectionOutline screenBox={screenBox} />
          <ResizeHandles screenBox={screenBox} onBeginResize={beginResize} />
        </>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Markup — strikeout / underline over a dragged region (the box-drag   */
/* equivalent of text-selection markup; see design doc §5, Phase 2)     */
/* ------------------------------------------------------------------ */

function MarkupAnnotationView(props: AnnotationViewProps & { annotation: MarkupAnnotation }) {
  const { annotation, selected, onSelect } = props;
  const { screenBox, beginMove, beginResize, onPointerMove, onPointerUp } = useBoxAnnotation(props, annotation);

  const lineY = annotation.type === "strikeout" ? screenBox.sy + screenBox.height / 2 : screenBox.sy + screenBox.height * 0.88;

  return (
    <g data-annotation-id={annotation.id}>
      {/* Transparent hit area — the visible line is thin and hard to grab on its own. */}
      <rect
        x={screenBox.sx}
        y={screenBox.sy}
        width={screenBox.width}
        height={screenBox.height}
        fill="transparent"
        style={{ cursor: "move" }}
        onPointerDown={(e) => {
          onSelect(annotation.id);
          beginMove(e);
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      <line x1={screenBox.sx} y1={lineY} x2={screenBox.sx + screenBox.width} y2={lineY} stroke={annotation.color} strokeWidth={2.5} pointerEvents="none" />
      {selected && (
        <>
          <SelectionOutline screenBox={screenBox} />
          <ResizeHandles screenBox={screenBox} onBeginResize={beginResize} />
        </>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Shape (rectangle / ellipse / line / arrow)                          */
/* ------------------------------------------------------------------ */

function ShapeAnnotationView(props: AnnotationViewProps & { annotation: ShapeAnnotation }) {
  const { annotation, selected, page, svgRef, onSelect, onUpdate } = props;

  if (annotation.kind === "line" || annotation.kind === "arrow") {
    const start = { x: annotation.x, y: annotation.y };
    const end = { x: annotation.x + annotation.width, y: annotation.y + annotation.height };
    const { live, begin, onPointerMove, onPointerUp } = useEndpointDrag(svgRef, page, start, end, (s, e) => {
      onUpdate(annotation.id, { x: s.x, y: s.y, width: e.x - s.x, height: e.y - s.y });
    });
    const s1 = pdfToScreen(page, live.start.x, live.start.y);
    const s2 = pdfToScreen(page, live.end.x, live.end.y);
    const angle = Math.atan2(s2.sy - s1.sy, s2.sx - s1.sx);
    const headLen = Math.max(10, annotation.strokeWidth * 5);
    const spread = Math.PI / 7;
    const h1 = { x: s2.sx - headLen * Math.cos(angle - spread), y: s2.sy - headLen * Math.sin(angle - spread) };
    const h2 = { x: s2.sx - headLen * Math.cos(angle + spread), y: s2.sy - headLen * Math.sin(angle + spread) };

    return (
      <g data-annotation-id={annotation.id}>
        {/* Wide invisible hit-area line — the visible stroke can be too thin to grab reliably. */}
        <line x1={s1.sx} y1={s1.sy} x2={s2.sx} y2={s2.sy} stroke="transparent" strokeWidth={Math.max(16, annotation.strokeWidth * RENDER_SCALE)} style={{ cursor: "move" }} onPointerDown={(e) => { onSelect(annotation.id); begin("both")(e); }} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} />
        <line x1={s1.sx} y1={s1.sy} x2={s2.sx} y2={s2.sy} stroke={annotation.strokeColor} strokeWidth={annotation.strokeWidth * RENDER_SCALE} strokeLinecap="round" pointerEvents="none" />
        {annotation.kind === "arrow" && (
          <path
            d={`M${s2.sx},${s2.sy} L${h1.x},${h1.y} M${s2.sx},${s2.sy} L${h2.x},${h2.y}`}
            stroke={annotation.strokeColor}
            strokeWidth={annotation.strokeWidth * RENDER_SCALE}
            strokeLinecap="round"
            pointerEvents="none"
          />
        )}
        {selected && (
          <>
            <circle cx={s1.sx} cy={s1.sy} r={5} className="pdfed__handle" onPointerDown={begin("start")} />
            <circle cx={s2.sx} cy={s2.sy} r={5} className="pdfed__handle" onPointerDown={begin("end")} />
          </>
        )}
      </g>
    );
  }

  const { screenBox, beginMove, beginResize, onPointerMove, onPointerUp } = useBoxAnnotation(props, annotation);
  const commonProps = {
    stroke: annotation.strokeColor,
    strokeWidth: annotation.strokeWidth * RENDER_SCALE,
    fill: annotation.fillColor ?? "transparent",
    style: { cursor: "move" as const },
    onPointerDown: (e: ReactPointerEvent) => {
      onSelect(annotation.id);
      beginMove(e);
    },
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  };

  return (
    <g data-annotation-id={annotation.id}>
      {annotation.kind === "rectangle" ? (
        <rect x={screenBox.sx} y={screenBox.sy} width={screenBox.width} height={screenBox.height} {...commonProps} />
      ) : (
        <ellipse
          cx={screenBox.sx + screenBox.width / 2}
          cy={screenBox.sy + screenBox.height / 2}
          rx={Math.abs(screenBox.width) / 2}
          ry={Math.abs(screenBox.height) / 2}
          {...commonProps}
        />
      )}
      {selected && (
        <>
          <SelectionOutline screenBox={screenBox} />
          <ResizeHandles screenBox={screenBox} onBeginResize={beginResize} />
        </>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Link                                                                 */
/* ------------------------------------------------------------------ */

function LinkAnnotationView(props: AnnotationViewProps & { annotation: LinkAnnotation }) {
  const { annotation, selected, onSelect } = props;
  const { screenBox, beginMove, beginResize, onPointerMove, onPointerUp } = useBoxAnnotation(props, annotation);

  return (
    <g data-annotation-id={annotation.id}>
      <rect
        x={screenBox.sx}
        y={screenBox.sy}
        width={screenBox.width}
        height={screenBox.height}
        fill="var(--accent-soft)"
        fillOpacity={0.5}
        stroke="var(--accent)"
        strokeWidth={1.5}
        strokeDasharray="4 3"
        style={{ cursor: "move" }}
        onPointerDown={(e) => {
          onSelect(annotation.id);
          beginMove(e);
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      {selected && <ResizeHandles screenBox={screenBox} onBeginResize={beginResize} />}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Whiteout                                                             */
/* ------------------------------------------------------------------ */

function WhiteoutAnnotationView(props: AnnotationViewProps & { annotation: WhiteoutAnnotation }) {
  const { annotation, selected, onSelect } = props;
  const { screenBox, beginMove, beginResize, onPointerMove, onPointerUp } = useBoxAnnotation(props, annotation);

  return (
    <g data-annotation-id={annotation.id}>
      <rect
        x={screenBox.sx}
        y={screenBox.sy}
        width={screenBox.width}
        height={screenBox.height}
        fill="#FFFFFF"
        stroke={selected ? "var(--accent)" : "none"}
        strokeWidth={selected ? 1.5 : 0}
        strokeDasharray={selected ? "4 3" : undefined}
        style={{ cursor: "move" }}
        onPointerDown={(e) => {
          onSelect(annotation.id);
          beginMove(e);
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      {selected && <ResizeHandles screenBox={screenBox} onBeginResize={beginResize} />}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Form field — a real AcroForm field at flatten time (see pdf-edit.ts), */
/* rendered here as a labeled placeholder since it isn't interactive    */
/* until the exported PDF is opened in a real reader.                   */
/* ------------------------------------------------------------------ */

const FORM_FIELD_LABEL: Record<FormFieldAnnotation["kind"], string> = {
  text: "Text",
  multiline: "Text (multiline)",
  dropdown: "Dropdown ▾",
  checkbox: "☑",
  radio: "◉",
};

function FormFieldAnnotationView(props: AnnotationViewProps & { annotation: FormFieldAnnotation }) {
  const { annotation, selected, onSelect } = props;
  const { screenBox, beginMove, beginResize, onPointerMove, onPointerUp } = useBoxAnnotation(props, annotation);

  return (
    <g data-annotation-id={annotation.id}>
      <rect
        x={screenBox.sx}
        y={screenBox.sy}
        width={screenBox.width}
        height={screenBox.height}
        fill="#EDF0FF"
        fillOpacity={0.7}
        stroke="#6B72E6"
        strokeWidth={1.25}
        strokeDasharray="3 2"
        style={{ cursor: "move" }}
        onPointerDown={(e) => {
          onSelect(annotation.id);
          beginMove(e);
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      <text
        x={screenBox.sx + 4}
        y={screenBox.sy + screenBox.height / 2 + 4}
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize={Math.min(12, screenBox.height * 0.6)}
        fill="#4448B8"
        pointerEvents="none"
        style={{ userSelect: "none" }}
      >
        {FORM_FIELD_LABEL[annotation.kind]}
      </text>
      {selected && (
        <>
          <SelectionOutline screenBox={screenBox} />
          <ResizeHandles screenBox={screenBox} onBeginResize={beginResize} />
        </>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Pen (freehand ink)                                                   */
/* ------------------------------------------------------------------ */

function PenAnnotationView(props: AnnotationViewProps & { annotation: PenAnnotation }) {
  const { annotation, page, selected, onSelect } = props;
  const screenBox = useMemo(() => getAnnotationScreenBox(page, annotation), [page, annotation]);

  return (
    <g
      data-annotation-id={annotation.id}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect(annotation.id);
      }}
    >
      <PenPath points={annotation.points} page={page} color={annotation.color} strokeWidth={annotation.strokeWidth} />
      {selected && <SelectionOutline screenBox={screenBox} />}
    </g>
  );
}

export function PenPath({
  points,
  page,
  color,
  strokeWidth,
}: {
  points: Array<{ x: number; y: number }>;
  page: RenderedPage;
  color: string;
  strokeWidth: number;
}) {
  const d = useMemo(() => {
    return points
      .map((p, i) => {
        const s = pdfToScreen(page, p.x, p.y);
        return `${i === 0 ? "M" : "L"}${s.sx.toFixed(2)},${s.sy.toFixed(2)}`;
      })
      .join(" ");
  }, [points, page]);

  return <path d={d} stroke={color} strokeWidth={strokeWidth * RENDER_SCALE} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
}

/* ------------------------------------------------------------------ */
/* Highlight (drag-box, translucent)                                    */
/* ------------------------------------------------------------------ */

function HighlightAnnotationView(props: AnnotationViewProps & { annotation: HighlightAnnotation }) {
  const { annotation, selected, onSelect } = props;
  const { screenBox, beginMove, beginResize, onPointerMove, onPointerUp } = useBoxAnnotation(props, annotation);

  return (
    <g data-annotation-id={annotation.id}>
      <rect
        x={screenBox.sx}
        y={screenBox.sy}
        width={screenBox.width}
        height={screenBox.height}
        fill={annotation.color}
        opacity={annotation.opacity}
        style={{ cursor: "move" }}
        onPointerDown={(e) => {
          onSelect(annotation.id);
          beginMove(e);
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      {selected && (
        <>
          <rect x={screenBox.sx} y={screenBox.sy} width={screenBox.width} height={screenBox.height} fill="none" stroke="var(--accent)" strokeWidth={2} pointerEvents="none" />
          <ResizeHandles screenBox={screenBox} onBeginResize={beginResize} />
        </>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Text                                                                 */
/* ------------------------------------------------------------------ */

function TextAnnotationView(props: AnnotationViewProps & { annotation: TextAnnotation }) {
  const { annotation, page, selected, editing, onStartEditingText, onStopEditingText, onUpdate, onSelect } = props;
  const screen = pdfToScreen(page, annotation.x, annotation.y);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      const el = inputRef.current;
      if (el) {
        el.focus();
        el.selectionStart = el.value.length;
        el.selectionEnd = el.value.length;
      }
    }
  }, [editing]);

  const displayFontSize = annotation.fontSize * RENDER_SCALE;
  const measuredWidth = Math.max(60, (annotation.text.length || 8) * displayFontSize * 0.55 + 12);
  const measuredHeight = displayFontSize * 1.4 + 6;
  const screenBox = { sx: screen.sx - 4, sy: screen.sy - 2, width: measuredWidth, height: measuredHeight };

  if (editing) {
    return (
      <foreignObject
        data-annotation-id={annotation.id}
        x={screen.sx - 4}
        y={screen.sy - 2}
        width={Math.max(measuredWidth + 40, 220)}
        height={Math.max(measuredHeight * 4, 90)}
      >
        <textarea
          ref={inputRef}
          className="pdfed__textedit"
          style={{
            font: `${annotation.italic ? "italic " : ""}${annotation.bold ? "700 " : ""}${displayFontSize}px Helvetica, Arial, sans-serif`,
            color: annotation.color,
            lineHeight: 1.2,
          }}
          value={annotation.text}
          onChange={(e) => onUpdate(annotation.id, { text: e.target.value })}
          onBlur={onStopEditingText}
          onKeyDown={(e) => {
            if (e.key === "Escape") e.currentTarget.blur();
          }}
          placeholder="Type text…"
        />
      </foreignObject>
    );
  }

  return (
    <g
      data-annotation-id={annotation.id}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect(annotation.id);
      }}
    >
      {selected && <SelectionOutline screenBox={screenBox} />}
      <text
        x={screen.sx}
        y={screen.sy + displayFontSize}
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize={displayFontSize}
        fontWeight={annotation.bold ? 700 : 400}
        fontStyle={annotation.italic ? "italic" : "normal"}
        fill={annotation.color}
        style={{ cursor: "text", userSelect: "none" }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onStartEditingText(annotation.id);
        }}
      >
        {annotation.text || "(empty)"}
      </text>
    </g>
  );
}
