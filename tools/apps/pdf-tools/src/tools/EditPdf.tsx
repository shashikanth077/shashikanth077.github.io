import {
  useCallback,
  useEffect,
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
  type HighlightAnnotation,
  type ImageAnnotation,
  type LinkAnnotation,
  type PenAnnotation,
  type ShapeAnnotation,
  type ShapeKind,
  type TextAnnotation,
  type WhiteoutAnnotation,
} from "@devtools/tools-core";
import { Button, FileDrop, Note, Spinner, useFileList } from "@devtools/ui";
import { downloadResult, PdfTool, useFileBytes, useProcessor } from "../shared.js";
import { RENDER_SCALE, pdfToScreen, screenToPdf, type RenderedPage } from "./edit-pdf/geometry.js";
import { Toolbar, type EditorTool } from "./edit-pdf/Toolbar.js";
import { AnnotationView, getAnnotationScreenBox } from "./edit-pdf/elements.js";
import { ElementToolbar } from "./edit-pdf/ElementToolbar.js";
import {
  COLORS,
  DEFAULT_FONT_SIZE,
  DEFAULT_SHAPE_STROKE_WIDTH,
  DEFAULT_STROKE_WIDTH,
  HIGHLIGHT_COLORS,
  HIGHLIGHT_OPACITY,
  MIN_DRAG_SIZE,
} from "./edit-pdf/constants.js";

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
      if (!ctx) throw new Error("Could not get a 2D canvas context.");

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

/** Reads an uploaded image file into a data URL plus its intrinsic pixel size. */
function readImageFile(file: File): Promise<{ dataUrl: string; width: number; height: number; format: "png" | "jpg" }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error("That file doesn't look like a valid image."));
      img.onload = () => {
        const format: "png" | "jpg" = file.type === "image/png" ? "png" : "jpg";
        resolve({ dataUrl, width: img.naturalWidth || 300, height: img.naturalHeight || 300, format });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function shapeKindFromTool(tool: EditorTool): ShapeKind | null {
  if (!tool.startsWith("shape-")) return null;
  return tool.slice("shape-".length) as ShapeKind;
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
  const [shapeStrokeColor, setShapeStrokeColor] = useState<string>(COLORS[0]!);
  const [shapeFillColor, setShapeFillColor] = useState<string | null>(null);

  const [history, setHistory] = useState<History>(() => newHistory());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const annotations = history.present;
  const file = files[0];

  const setAnnotations = useCallback((updater: (current: Annotation[]) => Annotation[]) => {
    setHistory((h) => commit(h, updater(h.present)));
  }, []);

  const addAnnotation = useCallback(
    (annotation: Annotation) => {
      setAnnotations((current) => [...current, annotation]);
      setSelectedId(annotation.id);
      if (annotation.type === "text") setEditingTextId(annotation.id);
    },
    [setAnnotations],
  );

  const updateAnnotation = useCallback(
    (id: string, patch: Partial<Annotation>) => {
      setAnnotations((current) => current.map((a) => (a.id === id ? ({ ...a, ...patch } as Annotation) : a)));
    },
    [setAnnotations],
  );

  const duplicateAnnotation = useCallback(
    (id: string) => {
      const source = history.present.find((a) => a.id === id);
      if (!source) return;
      const OFFSET = 12;
      const id2 = newAnnotationId();
      const copy: Annotation =
        source.type === "pen"
          ? { ...source, id: id2, points: source.points.map((p) => ({ x: p.x + OFFSET, y: p.y - OFFSET })) }
          : { ...source, id: id2, x: source.x + OFFSET, y: source.y - OFFSET };
      setAnnotations((current) => [...current, copy]);
      setSelectedId(copy.id);
    },
    [history.present, setAnnotations],
  );

  const deleteAnnotation = useCallback(
    (id: string) => {
      setAnnotations((current) => current.filter((a) => a.id !== id));
      setSelectedId((cur) => (cur === id ? null : cur));
      setEditingTextId((cur) => (cur === id ? null : cur));
    },
    [setAnnotations],
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
        setLoadError(err instanceof Error ? err.message : "Could not open this PDF. It may be corrupted.");
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
      const inField = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (inField) return;

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        setHistory((h) => undo(h));
        setSelectedId(null);
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
        e.preventDefault();
        setHistory((h) => redo(h));
        setSelectedId(null);
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        deleteAnnotation(selectedId);
      } else if (e.key === "Escape") {
        setSelectedId(null);
        setEditingTextId(null);
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedId, deleteAnnotation]);

  /* -------- image insert -------- */

  async function insertImage(imgFile: File) {
    const targetPage = pages[0];
    if (!targetPage) return;
    setImageError(null);
    try {
      const { dataUrl, width, height, format } = await readImageFile(imgFile);
      const MAX_PT = 220;
      const scale = Math.min(MAX_PT / width, MAX_PT / height, 1);
      const w = width * scale;
      const h = height * scale;
      const ann: ImageAnnotation = {
        id: newAnnotationId(),
        page: targetPage.pageNumber,
        type: "image",
        x: (targetPage.pdfWidth - w) / 2,
        y: (targetPage.pdfHeight - h) / 2,
        width: w,
        height: h,
        dataUrl,
        format,
      };
      addAnnotation(ann);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Could not insert that image.");
    }
  }

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
        <FileDrop onFiles={add} accept={[".pdf"]} multiple={false} label="Drop a PDF here to edit it" />
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
      <div
        className="pdfed"
        onClick={(e) => {
          // A click that originated on an annotation (or its floating
          // toolbar) already handled selection itself, in its own
          // pointerdown — pointerdown's stopPropagation does not stop the
          // *click* event that follows it, so without this guard every
          // annotation click immediately deselects what it just selected.
          //
          // Blank-canvas deselection only makes sense for "select" — every
          // other tool's blank click is a creation gesture (handled by the
          // page's pointerdown/up flow) that should keep its new element
          // selected, not have this bubble-up handler immediately clear it.
          if (tool !== "select") return;
          const target = e.target as HTMLElement;
          if (target.closest("[data-annotation-id]") || target.closest(".pdfed__element-toolbar")) return;
          setSelectedId(null);
        }}
      >
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
          shapeStrokeColor={shapeStrokeColor}
          onShapeStrokeColorChange={setShapeStrokeColor}
          shapeFillColor={shapeFillColor}
          onShapeFillColorChange={setShapeFillColor}
          onInsertImage={insertImage}
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
              shapeStrokeColor={shapeStrokeColor}
              shapeFillColor={shapeFillColor}
              selectedId={selectedId}
              editingTextId={editingTextId}
              onSelect={setSelectedId}
              onStartEditingText={setEditingTextId}
              onStopEditingText={() => setEditingTextId(null)}
              onAdd={addAnnotation}
              onUpdate={updateAnnotation}
              onDuplicate={duplicateAnnotation}
              onDelete={deleteAnnotation}
            />
          ))}
        </div>

        {imageError && <Note kind="error">{imageError}</Note>}
        {error && <Note kind="error">{error}</Note>}

        {results.length > 0 && results[0] && (
          <Note kind="success">
            PDF saved.{" "}
            <button type="button" onClick={() => downloadResult(results[0]!)} className="pdfed__download">
              Download {results[0].name}
            </button>
          </Note>
        )}
      </div>
    </PdfTool>
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
  shapeStrokeColor: string;
  shapeFillColor: string | null;
  selectedId: string | null;
  editingTextId: string | null;
  onSelect: (id: string | null) => void;
  onStartEditingText: (id: string) => void;
  onStopEditingText: () => void;
  onAdd: (annotation: Annotation) => void;
  onUpdate: (id: string, patch: Partial<Annotation>) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

type Drawing =
  | { kind: "pen"; points: Array<{ x: number; y: number }>; color: string; strokeWidth: number }
  | { kind: "box"; tool: "highlight" | "whiteout" | "link" | "shape"; shapeKind?: ShapeKind; startX: number; startY: number; endX: number; endY: number };

function PageEditor(props: PageEditorProps) {
  const {
    page,
    annotations,
    tool,
    color,
    highlightColor,
    fontSize,
    strokeWidth,
    shapeStrokeColor,
    shapeFillColor,
    selectedId,
    editingTextId,
    onSelect,
    onStartEditingText,
    onStopEditingText,
    onAdd,
    onUpdate,
    onDuplicate,
    onDelete,
  } = props;

  const svgRef = useRef<SVGSVGElement>(null);
  const [drawing, setDrawing] = useState<Drawing | null>(null);

  function getPointerPos(e: ReactPointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * page.screenWidth;
    const sy = ((e.clientY - rect.top) / rect.height) * page.screenHeight;
    return { sx, sy };
  }

  function onPointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    if (tool === "select" || tool === "image") return;
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

    if (tool === "highlight" || tool === "whiteout" || tool === "link") {
      setDrawing({ kind: "box", tool, startX: pos.sx, startY: pos.sy, endX: pos.sx, endY: pos.sy });
      return;
    }

    const shapeKind = shapeKindFromTool(tool);
    if (shapeKind) {
      setDrawing({ kind: "box", tool: "shape", shapeKind, startX: pos.sx, startY: pos.sy, endX: pos.sx, endY: pos.sy });
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
    } else {
      setDrawing({ ...drawing, endX: pos.sx, endY: pos.sy });
    }
  }

  function onPointerUp(e: ReactPointerEvent<SVGSVGElement>) {
    if (!drawing) return;
    (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);

    if (drawing.kind === "pen") {
      if (drawing.points.length >= 2) {
        const ann: PenAnnotation = {
          id: newAnnotationId(),
          page: page.pageNumber,
          type: "pen",
          points: drawing.points,
          color: drawing.color,
          strokeWidth: drawing.strokeWidth,
        };
        onAdd(ann);
      }
      setDrawing(null);
      return;
    }

    const minX = Math.min(drawing.startX, drawing.endX);
    const minY = Math.min(drawing.startY, drawing.endY);
    const maxX = Math.max(drawing.startX, drawing.endX);
    const maxY = Math.max(drawing.startY, drawing.endY);
    const w = maxX - minX;
    const h = maxY - minY;

    if (w >= MIN_DRAG_SIZE && h >= MIN_DRAG_SIZE) {
      // Screen rect -> PDF rect (y flipped): top-left/bottom-right swap roles.
      const topLeft = screenToPdf(page, minX, minY);
      const bottomRight = screenToPdf(page, maxX, maxY);
      const box = { x: topLeft.x, y: bottomRight.y, width: bottomRight.x - topLeft.x, height: topLeft.y - bottomRight.y };

      if (drawing.tool === "highlight") {
        const ann: HighlightAnnotation = {
          id: newAnnotationId(),
          page: page.pageNumber,
          type: "highlight",
          ...box,
          color: highlightColor,
          opacity: HIGHLIGHT_OPACITY,
        };
        onAdd(ann);
      } else if (drawing.tool === "whiteout") {
        const ann: WhiteoutAnnotation = { id: newAnnotationId(), page: page.pageNumber, type: "whiteout", ...box };
        onAdd(ann);
      } else if (drawing.tool === "link") {
        const ann: LinkAnnotation = { id: newAnnotationId(), page: page.pageNumber, type: "link", ...box, url: "" };
        onAdd(ann);
      } else if (drawing.tool === "shape" && drawing.shapeKind) {
        const ann: ShapeAnnotation = {
          id: newAnnotationId(),
          page: page.pageNumber,
          type: "shape",
          kind: drawing.shapeKind,
          ...box,
          strokeColor: shapeStrokeColor,
          fillColor: shapeFillColor,
          strokeWidth: DEFAULT_SHAPE_STROKE_WIDTH,
        };
        onAdd(ann);
      }
    }

    setDrawing(null);
  }

  const cursorClass =
    tool === "select" || tool === "image"
      ? "pdfed__svg--select"
      : tool === "text"
        ? "pdfed__svg--text"
        : "pdfed__svg--crosshair";

  const selected = selectedId ? annotations.find((a) => a.id === selectedId) : undefined;

  return (
    <div className="pdfed__page">
      <div className="pdfed__pagenum">Page {page.pageNumber}</div>
      <div
        className="pdfed__pageframe"
        style={{ width: page.screenWidth, aspectRatio: `${page.screenWidth} / ${page.screenHeight}` }}
      >
        <img src={page.dataUrl} alt={`Page ${page.pageNumber}`} className="pdfed__pageimg" draggable={false} />
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
            // Blank-canvas clicks with a creation tool active are already
            // handled by the pointerdown/up drag flow above — only "select"
            // needs click-to-deselect, since existing elements select
            // themselves directly (and stop propagation) regardless of tool.
            if (tool !== "select") return;
            const target = e.target as Element;
            if (!target.closest("[data-annotation-id]")) onSelect(null);
          }}
        >
          {annotations.map((ann) => (
            <AnnotationView
              key={ann.id}
              annotation={ann}
              page={page}
              svgRef={svgRef}
              selected={selectedId === ann.id}
              editing={editingTextId === ann.id}
              onSelect={onSelect}
              onStartEditingText={onStartEditingText}
              onStopEditingText={onStopEditingText}
              onUpdate={onUpdate}
            />
          ))}

          {drawing?.kind === "pen" && drawing.points.length > 1 && (
            <PenPathPreview points={drawing.points} page={page} color={drawing.color} strokeWidth={drawing.strokeWidth} />
          )}
          {drawing?.kind === "box" && (
            <rect
              x={Math.min(drawing.startX, drawing.endX)}
              y={Math.min(drawing.startY, drawing.endY)}
              width={Math.abs(drawing.endX - drawing.startX)}
              height={Math.abs(drawing.endY - drawing.startY)}
              fill={
                drawing.tool === "highlight"
                  ? highlightColor
                  : drawing.tool === "whiteout"
                    ? "#FFFFFF"
                    : drawing.tool === "link"
                      ? "var(--accent-soft)"
                      : (shapeFillColor ?? "transparent")
              }
              fillOpacity={drawing.tool === "highlight" ? HIGHLIGHT_OPACITY : drawing.tool === "shape" ? 1 : 0.5}
              stroke={drawing.tool === "shape" ? shapeStrokeColor : drawing.tool === "link" ? "var(--accent)" : "none"}
              strokeWidth={drawing.tool === "shape" ? DEFAULT_SHAPE_STROKE_WIDTH * RENDER_SCALE : 1.5}
              strokeDasharray={drawing.tool === "link" ? "4 3" : undefined}
            />
          )}
        </svg>

        {selected && (
          <ElementToolbar
            box={getAnnotationScreenBox(page, selected)}
            onDuplicate={() => onDuplicate(selected.id)}
            onDelete={() => onDelete(selected.id)}
          >
            {selected.type === "link" && (
              <input
                type="url"
                className="pdfed__link-input"
                placeholder="https://…"
                defaultValue={selected.url}
                onPointerDown={(e) => e.stopPropagation()}
                onChange={(e) => onUpdate(selected.id, { url: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              />
            )}
          </ElementToolbar>
        )}
      </div>
    </div>
  );
}

function PenPathPreview({
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
  const d = points
    .map((p, i) => {
      const s = pdfToScreen(page, p.x, p.y);
      return `${i === 0 ? "M" : "L"}${s.sx.toFixed(2)},${s.sy.toFixed(2)}`;
    })
    .join(" ");
  return <path d={d} stroke={color} strokeWidth={strokeWidth * RENDER_SCALE} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
}
