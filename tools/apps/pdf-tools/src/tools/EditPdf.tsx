import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import "./EditPdf.css";
import {
  flattenAnnotations,
  newAnnotationId,
  openPdf,
  type Annotation,
  type AnnotationTool,
  type PenAnnotation,
  type TextAnnotation,
  type HighlightAnnotation,
} from "@devtools/tools-core";
import { Button, FileDrop, Note, Spinner, useFileList } from "@devtools/ui";
import { downloadResult, PdfTool, useFileBytes, useProcessor } from "../shared.js";

/* ------------------------------------------------------------------ */
/* Constants                                                            */
/* ------------------------------------------------------------------ */

const RENDER_SCALE = 1.5;
const COLORS = ["#000000", "#E8505B", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"];
const HIGHLIGHT_COLORS = ["#FEF08A", "#BBF7D0", "#BFDBFE", "#FBCFE8"];
const HIGHLIGHT_OPACITY = 0.4;
const DEFAULT_FONT_SIZE = 14;
const DEFAULT_STROKE_WIDTH = 2;

type EditorTool = "select" | AnnotationTool;

interface RenderedPage {
  pageNumber: number;
  /** Pixel size of the rendered canvas image. */
  screenWidth: number;
  screenHeight: number;
  /** Natural PDF page size in points (72pt = 1 inch). */
  pdfWidth: number;
  pdfHeight: number;
  dataUrl: string;
}

/* ------------------------------------------------------------------ */
/* Coordinate helpers                                                   */
/* ------------------------------------------------------------------ */

/**
 * pdf-lib coordinates are bottom-left origin, in PostScript points.
 * The SVG overlay uses top-left origin, in screen pixels at RENDER_SCALE.
 * These two functions are the only place that transformation lives.
 */
function screenToPdf(page: RenderedPage, sx: number, sy: number): { x: number; y: number } {
  return {
    x: sx / RENDER_SCALE,
    y: page.pdfHeight - sy / RENDER_SCALE,
  };
}

function pdfToScreen(page: RenderedPage, x: number, y: number): { sx: number; sy: number } {
  return {
    sx: x * RENDER_SCALE,
    sy: (page.pdfHeight - y) * RENDER_SCALE,
  };
}

/* ------------------------------------------------------------------ */
/* PDF rendering                                                        */
/* ------------------------------------------------------------------ */

async function renderPagesToImages(bytes: ArrayBuffer): Promise<RenderedPage[]> {
  const { doc, pageCount, close } = await openPdf(bytes);
  const pages: RenderedPage[] = [];

  try {
    for (let n = 1; n <= pageCount; n++) {
      const page = await doc.getPage(n);
      const viewport = page.getViewport({ scale: RENDER_SCALE });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get 2D canvas context.");

      // See pdf-render.ts for why these specific options.
      await page.render({ canvas, viewport, intent: "print", background: "#ffffff" }).promise;

      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const natural = page.getViewport({ scale: 1 });

      pages.push({
        pageNumber: n,
        screenWidth: canvas.width,
        screenHeight: canvas.height,
        pdfWidth: natural.width,
        pdfHeight: natural.height,
        dataUrl,
      });

      page.cleanup();
      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    await close();
  }

  return pages;
}

/* ------------------------------------------------------------------ */
/* History                                                              */
/* ------------------------------------------------------------------ */

interface History {
  past: Annotation[][];
  present: Annotation[];
  future: Annotation[][];
}

function newHistory(initial: Annotation[] = []): History {
  return { past: [], present: initial, future: [] };
}

function commit(history: History, next: Annotation[]): History {
  if (next === history.present) return history;
  return { past: [...history.past, history.present], present: next, future: [] };
}

function undo(history: History): History {
  const previous = history.past[history.past.length - 1];
  if (previous === undefined) return history;
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

function redo(history: History): History {
  const next = history.future[0];
  if (next === undefined) return history;
  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1),
  };
}

/* ------------------------------------------------------------------ */
/* Editor                                                               */
/* ------------------------------------------------------------------ */

export default function EditPdf() {
  const { files, add, clear } = useFileList();
  const getBytes = useFileBytes();
  const { busy, error, results, run } = useProcessor();

  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [tool, setTool] = useState<EditorTool>("select");
  const [color, setColor] = useState<string>(COLORS[1]!);
  const [highlightColor, setHighlightColor] = useState<string>(HIGHLIGHT_COLORS[0]!);
  const [fontSize, setFontSize] = useState<number>(DEFAULT_FONT_SIZE);
  const [strokeWidth, setStrokeWidth] = useState<number>(DEFAULT_STROKE_WIDTH);

  const [history, setHistory] = useState<History>(() => newHistory());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const annotations = history.present;
  const file = files[0];

  const setAnnotations = useCallback(
    (updater: (current: Annotation[]) => Annotation[]) => {
      setHistory((h) => commit(h, updater(h.present)));
    },
    [],
  );

  /* -------- load PDF when file changes -------- */

  useEffect(() => {
    if (!file) {
      setPages([]);
      setPdfBytes(null);
      setHistory(newHistory());
      setSelectedId(null);
      setEditingTextId(null);
      setLoadError(null);
      return;
    }

    let cancelled = false;
    setLoadingPdf(true);
    setLoadError(null);
    setHistory(newHistory());
    setSelectedId(null);
    setEditingTextId(null);

    (async () => {
      try {
        const bytes = await getBytes(file);
        // Keep a private copy — pdfjs neuters the buffer during rendering.
        const kept = bytes.slice(0);
        const rendered = await renderPagesToImages(bytes);
        if (cancelled) return;
        setPdfBytes(kept);
        setPages(rendered);
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err instanceof Error ? err.message : "Could not open this PDF. It may be corrupted.",
        );
      } finally {
        if (!cancelled) setLoadingPdf(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [file, getBytes]);

  /* -------- keyboard: undo, redo, delete, escape -------- */

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inField =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (inField) return;

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        setHistory((h) => undo(h));
        setSelectedId(null);
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))
      ) {
        e.preventDefault();
        setHistory((h) => redo(h));
        setSelectedId(null);
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        const target = selectedId;
        setAnnotations((current) => current.filter((a) => a.id !== target));
        setSelectedId(null);
      } else if (e.key === "Escape") {
        setSelectedId(null);
        setEditingTextId(null);
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedId, setAnnotations]);

  /* -------- save -------- */

  async function save() {
    if (!pdfBytes || !file) return;
    // Commit any in-progress text edits by unfocusing them.
    setEditingTextId(null);

    await run(async () => {
      const data = await flattenAnnotations(pdfBytes.slice(0), annotations);
      const blob = new Blob([data as unknown as BlobPart], { type: "application/pdf" });
      const name = file.file.name.replace(/\.pdf$/i, "-edited.pdf");
      return [{ name, blob }];
    });
  }

  function reset() {
    clear();
  }

  /* -------- upload state -------- */

  if (!file) {
    return (
      <PdfTool slug="edit-pdf">
        <FileDrop
          onFiles={add}
          accept={[".pdf"]}
          multiple={false}
          label="Drop a PDF here to edit it"
        />
      </PdfTool>
    );
  }

  if (loadingPdf) {
    return (
      <PdfTool slug="edit-pdf">
        <Spinner label="Rendering PDF pages…" />
      </PdfTool>
    );
  }

  if (loadError) {
    return (
      <PdfTool slug="edit-pdf">
        <Note kind="error">{loadError}</Note>
        <Button variant="ghost" onClick={reset}>
          Choose a different PDF
        </Button>
      </PdfTool>
    );
  }

  /* -------- editor -------- */

  return (
    <PdfTool slug="edit-pdf">
      <div className="pdfed" onClick={() => setSelectedId(null)}>
        <Toolbar
          tool={tool}
          onToolChange={setTool}
          color={color}
          onColorChange={setColor}
          highlightColor={highlightColor}
          onHighlightColorChange={setHighlightColor}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          canUndo={history.past.length > 0}
          canRedo={history.future.length > 0}
          onUndo={() => {
            setHistory((h) => undo(h));
            setSelectedId(null);
          }}
          onRedo={() => {
            setHistory((h) => redo(h));
            setSelectedId(null);
          }}
          onReset={reset}
          onSave={save}
          saving={busy}
          fileName={file.file.name}
          annotationCount={annotations.length}
        />

        <div className="pdfed__viewport">
          {pages.map((page) => (
            <PageEditor
              key={page.pageNumber}
              page={page}
              annotations={annotations.filter((a) => a.page === page.pageNumber)}
              tool={tool}
              color={color}
              highlightColor={highlightColor}
              fontSize={fontSize}
              strokeWidth={strokeWidth}
              selectedId={selectedId}
              editingTextId={editingTextId}
              onSelect={setSelectedId}
              onStartEditingText={setEditingTextId}
              onStopEditingText={() => setEditingTextId(null)}
              onAdd={(annotation) => {
                setAnnotations((current) => [...current, annotation]);
                if (annotation.type === "text") {
                  setSelectedId(annotation.id);
                  setEditingTextId(annotation.id);
                }
              }}
              onUpdate={(id, patch) => {
                setAnnotations((current) =>
                  current.map((a) => (a.id === id ? ({ ...a, ...patch } as Annotation) : a)),
                );
              }}
            />
          ))}
        </div>

        {error && <Note kind="error">{error}</Note>}

        {results.length > 0 && results[0] && (
          <Note kind="success">
            PDF saved.{" "}
            <button
              type="button"
              onClick={() => downloadResult(results[0]!)}
              className="pdfed__download"
            >
              Download {results[0].name}
            </button>
          </Note>
        )}
      </div>
    </PdfTool>
  );
}

/* ------------------------------------------------------------------ */
/* Toolbar                                                              */
/* ------------------------------------------------------------------ */

interface ToolbarProps {
  tool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  color: string;
  onColorChange: (color: string) => void;
  highlightColor: string;
  onHighlightColorChange: (color: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onSave: () => void;
  saving: boolean;
  fileName: string;
  annotationCount: number;
}

function Toolbar(props: ToolbarProps) {
  return (
    <div className="pdfed__toolbar" onClick={(e) => e.stopPropagation()}>
      <div className="pdfed__toolbar-group">
        <span className="pdfed__filename" title={props.fileName}>
          {props.fileName}
        </span>
      </div>

      <div className="pdfed__toolbar-group" role="radiogroup" aria-label="Tool">
        <ToolButton current={props.tool} value="select" onClick={props.onToolChange} label="Select">
          <SelectIcon />
        </ToolButton>
        <ToolButton current={props.tool} value="text" onClick={props.onToolChange} label="Text">
          <TextIcon />
        </ToolButton>
        <ToolButton current={props.tool} value="pen" onClick={props.onToolChange} label="Pen">
          <PenIcon />
        </ToolButton>
        <ToolButton
          current={props.tool}
          value="highlight"
          onClick={props.onToolChange}
          label="Highlight"
        >
          <HighlightIcon />
        </ToolButton>
      </div>

      {(props.tool === "text" || props.tool === "pen") && (
        <div className="pdfed__toolbar-group">
          <span className="pdfed__toolbar-label">Color</span>
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`pdfed__swatch${props.color === c ? " pdfed__swatch--active" : ""}`}
              style={{ background: c }}
              onClick={() => props.onColorChange(c)}
              aria-label={`Color ${c}`}
              aria-pressed={props.color === c}
            />
          ))}
        </div>
      )}

      {props.tool === "highlight" && (
        <div className="pdfed__toolbar-group">
          <span className="pdfed__toolbar-label">Color</span>
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`pdfed__swatch${props.highlightColor === c ? " pdfed__swatch--active" : ""}`}
              style={{ background: c }}
              onClick={() => props.onHighlightColorChange(c)}
              aria-label={`Highlight ${c}`}
              aria-pressed={props.highlightColor === c}
            />
          ))}
        </div>
      )}

      {props.tool === "text" && (
        <div className="pdfed__toolbar-group">
          <label className="pdfed__toolbar-label" htmlFor="pdfed-fontsize">
            Size
          </label>
          <select
            id="pdfed-fontsize"
            className="pdfed__select"
            value={props.fontSize}
            onChange={(e) => props.onFontSizeChange(Number(e.target.value))}
          >
            {[10, 12, 14, 16, 18, 20, 24, 30, 36, 48].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {props.tool === "pen" && (
        <div className="pdfed__toolbar-group">
          <label className="pdfed__toolbar-label" htmlFor="pdfed-stroke">
            Thickness
          </label>
          <input
            id="pdfed-stroke"
            type="range"
            min="1"
            max="8"
            step="1"
            value={props.strokeWidth}
            onChange={(e) => props.onStrokeWidthChange(Number(e.target.value))}
          />
        </div>
      )}

      <div className="pdfed__toolbar-group">
        <button
          type="button"
          className="pdfed__iconbtn"
          onClick={props.onUndo}
          disabled={!props.canUndo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <UndoIcon />
        </button>
        <button
          type="button"
          className="pdfed__iconbtn"
          onClick={props.onRedo}
          disabled={!props.canRedo}
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
        >
          <RedoIcon />
        </button>
      </div>

      <div className="pdfed__toolbar-spacer" />

      <div className="pdfed__toolbar-group">
        <span className="pdfed__count">
          {props.annotationCount} {props.annotationCount === 1 ? "edit" : "edits"}
        </span>
        <Button variant="ghost" onClick={props.onReset} disabled={props.saving}>
          Close
        </Button>
        <Button variant="primary" onClick={props.onSave} disabled={props.saving}>
          {props.saving ? "Saving…" : "Save & Download"}
        </Button>
      </div>
    </div>
  );
}

function ToolButton({
  current,
  value,
  onClick,
  label,
  children,
}: {
  current: EditorTool;
  value: EditorTool;
  onClick: (t: EditorTool) => void;
  label: string;
  children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      className={`pdfed__toolbtn${active ? " pdfed__toolbtn--active" : ""}`}
      onClick={() => onClick(value)}
      title={label}
      aria-label={label}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Page editor                                                          */
/* ------------------------------------------------------------------ */

interface PageEditorProps {
  page: RenderedPage;
  annotations: Annotation[];
  tool: EditorTool;
  color: string;
  highlightColor: string;
  fontSize: number;
  strokeWidth: number;
  selectedId: string | null;
  editingTextId: string | null;
  onSelect: (id: string | null) => void;
  onStartEditingText: (id: string) => void;
  onStopEditingText: () => void;
  onAdd: (annotation: Annotation) => void;
  onUpdate: (id: string, patch: Partial<Annotation>) => void;
}

function PageEditor(props: PageEditorProps) {
  const {
    page,
    annotations,
    tool,
    color,
    highlightColor,
    fontSize,
    strokeWidth,
    selectedId,
    editingTextId,
    onSelect,
    onStartEditingText,
    onStopEditingText,
    onAdd,
    onUpdate,
  } = props;

  const svgRef = useRef<SVGSVGElement>(null);
  const [drawing, setDrawing] = useState<
    | { kind: "pen"; points: Array<{ x: number; y: number }>; color: string; strokeWidth: number }
    | { kind: "highlight"; startX: number; startY: number; endX: number; endY: number; color: string }
    | null
  >(null);

  function getPointerPos(e: ReactPointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * page.screenWidth;
    const sy = ((e.clientY - rect.top) / rect.height) * page.screenHeight;
    return { sx, sy };
  }

  function onPointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    if (tool === "select") return;

    // Ignore if clicking on an existing annotation (let its own handler run).
    if ((e.target as Element).closest("[data-annotation-id]")) return;

    const pos = getPointerPos(e);
    if (!pos) return;

    e.preventDefault();
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);

    if (tool === "text") {
      const pdf = screenToPdf(page, pos.sx, pos.sy);
      const ann: TextAnnotation = {
        id: newAnnotationId(),
        page: page.pageNumber,
        type: "text",
        x: pdf.x,
        y: pdf.y,
        text: "",
        fontSize,
        color,
      };
      onAdd(ann);
      return;
    }

    if (tool === "pen") {
      const pdf = screenToPdf(page, pos.sx, pos.sy);
      setDrawing({ kind: "pen", points: [pdf], color, strokeWidth });
      return;
    }

    if (tool === "highlight") {
      setDrawing({
        kind: "highlight",
        startX: pos.sx,
        startY: pos.sy,
        endX: pos.sx,
        endY: pos.sy,
        color: highlightColor,
      });
      return;
    }
  }

  function onPointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    if (!drawing) return;
    const pos = getPointerPos(e);
    if (!pos) return;

    if (drawing.kind === "pen") {
      const pdf = screenToPdf(page, pos.sx, pos.sy);
      const last = drawing.points[drawing.points.length - 1];
      // Skip zero-distance moves and near-duplicates to keep the path small.
      if (last && Math.abs(last.x - pdf.x) < 0.3 && Math.abs(last.y - pdf.y) < 0.3) return;
      setDrawing({ ...drawing, points: [...drawing.points, pdf] });
    } else if (drawing.kind === "highlight") {
      setDrawing({ ...drawing, endX: pos.sx, endY: pos.sy });
    }
  }

  function onPointerUp(e: ReactPointerEvent<SVGSVGElement>) {
    if (!drawing) return;
    (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);

    if (drawing.kind === "pen" && drawing.points.length >= 2) {
      const ann: PenAnnotation = {
        id: newAnnotationId(),
        page: page.pageNumber,
        type: "pen",
        points: drawing.points,
        color: drawing.color,
        strokeWidth: drawing.strokeWidth,
      };
      onAdd(ann);
    } else if (drawing.kind === "highlight") {
      const minX = Math.min(drawing.startX, drawing.endX);
      const minY = Math.min(drawing.startY, drawing.endY);
      const maxX = Math.max(drawing.startX, drawing.endX);
      const maxY = Math.max(drawing.startY, drawing.endY);
      const w = maxX - minX;
      const h = maxY - minY;
      if (w >= 4 && h >= 4) {
        // Convert screen rect to PDF-space rect (y is flipped).
        const topLeft = screenToPdf(page, minX, minY);
        const bottomRight = screenToPdf(page, maxX, maxY);
        const ann: HighlightAnnotation = {
          id: newAnnotationId(),
          page: page.pageNumber,
          type: "highlight",
          x: topLeft.x,
          y: bottomRight.y,
          width: bottomRight.x - topLeft.x,
          height: topLeft.y - bottomRight.y,
          color: drawing.color,
          opacity: HIGHLIGHT_OPACITY,
        };
        onAdd(ann);
      }
    }

    setDrawing(null);
  }

  const cursorClass =
    tool === "select"
      ? "pdfed__svg--select"
      : tool === "text"
        ? "pdfed__svg--text"
        : tool === "highlight"
          ? "pdfed__svg--highlight"
          : "pdfed__svg--pen";

  return (
    <div className="pdfed__page">
      <div className="pdfed__pagenum">Page {page.pageNumber}</div>
      <div
        className="pdfed__pageframe"
        style={{ width: page.screenWidth, aspectRatio: `${page.screenWidth} / ${page.screenHeight}` }}
      >
        <img
          src={page.dataUrl}
          alt={`Page ${page.pageNumber}`}
          className="pdfed__pageimg"
          draggable={false}
        />
        <svg
          ref={svgRef}
          className={`pdfed__svg ${cursorClass}`}
          viewBox={`0 0 ${page.screenWidth} ${page.screenHeight}`}
          preserveAspectRatio="none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClick={(e) => {
            // Only select/deselect at SVG level when using select tool.
            if (tool !== "select") return;
            const target = e.target as Element;
            const annEl = target.closest("[data-annotation-id]");
            if (!annEl) {
              onSelect(null);
              return;
            }
            const id = annEl.getAttribute("data-annotation-id");
            if (id) onSelect(id);
            e.stopPropagation();
          }}
        >
          {annotations.map((ann) => (
            <AnnotationView
              key={ann.id}
              annotation={ann}
              page={page}
              selected={selectedId === ann.id}
              editing={editingTextId === ann.id}
              onStartEditingText={onStartEditingText}
              onStopEditingText={onStopEditingText}
              onUpdate={onUpdate}
            />
          ))}

          {drawing?.kind === "pen" && drawing.points.length > 1 && (
            <PenPath
              points={drawing.points}
              page={page}
              color={drawing.color}
              strokeWidth={drawing.strokeWidth}
            />
          )}
          {drawing?.kind === "highlight" && (
            <rect
              x={Math.min(drawing.startX, drawing.endX)}
              y={Math.min(drawing.startY, drawing.endY)}
              width={Math.abs(drawing.endX - drawing.startX)}
              height={Math.abs(drawing.endY - drawing.startY)}
              fill={drawing.color}
              opacity={HIGHLIGHT_OPACITY}
            />
          )}
        </svg>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Individual annotations                                               */
/* ------------------------------------------------------------------ */

interface AnnotationViewProps {
  annotation: Annotation;
  page: RenderedPage;
  selected: boolean;
  editing: boolean;
  onStartEditingText: (id: string) => void;
  onStopEditingText: () => void;
  onUpdate: (id: string, patch: Partial<Annotation>) => void;
}

function AnnotationView(props: AnnotationViewProps) {
  const { annotation, page, selected, editing } = props;

  if (annotation.type === "text") {
    return <TextAnnotationView {...props} annotation={annotation} />;
  }
  if (annotation.type === "pen") {
    return (
      <g data-annotation-id={annotation.id}>
        <PenPath
          points={annotation.points}
          page={page}
          color={annotation.color}
          strokeWidth={annotation.strokeWidth}
        />
        {selected && !editing && <PenSelectionBox annotation={annotation} page={page} />}
      </g>
    );
  }
  const topLeft = pdfToScreen(page, annotation.x, annotation.y + annotation.height);
  return (
    <g data-annotation-id={annotation.id}>
      <rect
        x={topLeft.sx}
        y={topLeft.sy}
        width={annotation.width * RENDER_SCALE}
        height={annotation.height * RENDER_SCALE}
        fill={annotation.color}
        opacity={annotation.opacity}
        stroke={selected ? "var(--accent)" : "none"}
        strokeWidth={selected ? 2 : 0}
      />
    </g>
  );
}

function PenPath({
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

  return (
    <path
      d={d}
      stroke={color}
      strokeWidth={strokeWidth * RENDER_SCALE}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}

function PenSelectionBox({
  annotation,
  page,
}: {
  annotation: PenAnnotation;
  page: RenderedPage;
}) {
  const { minX, minY, maxX, maxY } = useMemo(() => {
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
    return { minX, minY, maxX, maxY };
  }, [annotation.points]);

  const topLeft = pdfToScreen(page, minX, maxY);
  return (
    <rect
      x={topLeft.sx - 4}
      y={topLeft.sy - 4}
      width={(maxX - minX) * RENDER_SCALE + 8}
      height={(maxY - minY) * RENDER_SCALE + 8}
      fill="none"
      stroke="var(--accent)"
      strokeWidth={1.5}
      strokeDasharray="4 3"
    />
  );
}

function TextAnnotationView({
  annotation,
  page,
  selected,
  editing,
  onStartEditingText,
  onStopEditingText,
  onUpdate,
}: AnnotationViewProps & { annotation: TextAnnotation }) {
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
  // Approximate width to fit the text — grows with content.
  const measuredWidth = Math.max(
    60,
    (annotation.text.length || 8) * displayFontSize * 0.55 + 12,
  );
  const measuredHeight = displayFontSize * 1.4 + 6;

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
            font: `${displayFontSize}px Helvetica, Arial, sans-serif`,
            color: annotation.color,
            lineHeight: 1.2,
          }}
          value={annotation.text}
          onChange={(e) => onUpdate(annotation.id, { text: e.target.value })}
          onBlur={() => {
            if (!annotation.text.trim()) {
              // Empty text — mark for cleanup by parent via update with empty string.
              // (Parent doesn't currently strip empties; add a small placeholder instead.)
              onUpdate(annotation.id, { text: annotation.text });
            }
            onStopEditingText();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.currentTarget.blur();
            }
          }}
          placeholder="Type text…"
        />
      </foreignObject>
    );
  }

  return (
    <g data-annotation-id={annotation.id}>
      {selected && (
        <rect
          x={screen.sx - 4}
          y={screen.sy - 2}
          width={measuredWidth}
          height={measuredHeight}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      )}
      <text
        x={screen.sx}
        y={screen.sy + displayFontSize}
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize={displayFontSize}
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

/* ------------------------------------------------------------------ */
/* Toolbar icons                                                        */
/* ------------------------------------------------------------------ */

function SelectIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l7 19 2-8 8-2z" />
    </svg>
  );
}
function TextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6V4h16v2" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
    </svg>
  );
}
function PenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4z" />
    </svg>
  );
}
function HighlightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l-6 6v3h3l6-6" />
      <path d="M13 5l6 6-2 2-6-6z" />
    </svg>
  );
}
function UndoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 00-15-6.7L3 13" />
    </svg>
  );
}
function RedoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0115-6.7L21 13" />
    </svg>
  );
}
