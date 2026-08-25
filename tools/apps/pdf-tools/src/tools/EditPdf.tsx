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
  type FormFieldAnnotation,
  type FormFieldKind,
  type HighlightAnnotation,
  type ImageAnnotation,
  type LinkAnnotation,
  type MarkupAnnotation,
  type PageSlot,
  type PenAnnotation,
  type ShapeAnnotation,
  type ShapeKind,
  type SignatureAnnotation,
  type TextAnnotation,
  type WhiteoutAnnotation,
} from "@devtools/tools-core";
import { Button, FileDrop, Note, Spinner, useFileList } from "@devtools/ui";
import { downloadResult, PdfTool, useFileBytes, useProcessor } from "../shared.js";
import { RENDER_SCALE, pdfToScreen, scaleScreenBox, screenToPdf, type RenderedPage } from "./edit-pdf/geometry.js";
import { Toolbar, type EditorTool, type RecentSignature } from "./edit-pdf/Toolbar.js";
import { AnnotationView, getAnnotationScreenBox } from "./edit-pdf/elements.js";
import { ElementToolbar } from "./edit-pdf/ElementToolbar.js";
import { TextToolbarControls } from "./edit-pdf/TextToolbarControls.js";
import { SignatureModal, type SignatureResult } from "./edit-pdf/SignatureModal.js";
import { FindReplacePanel } from "./edit-pdf/FindReplacePanel.js";
import { PageThumbnails, type ThumbnailEntry } from "./edit-pdf/PageThumbnails.js";
import { PageChrome } from "./edit-pdf/PageChrome.js";
import { findMatches, findRunAt, type TextMatch, type TextRun } from "./edit-pdf/textSearch.js";
import { matchStandardFont } from "./edit-pdf/fontMatch.js";
import { sampleRunColors } from "./edit-pdf/colorSample.js";
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
/* Recent signatures — persisted locally so "Sign" can offer reuse      */
/* across visits, without any server.                                  */
/* ------------------------------------------------------------------ */

const RECENT_SIGNATURES_KEY = "edit-pdf:recent-signatures";
const MAX_RECENT_SIGNATURES = 5;

function loadRecentSignatures(): RecentSignature[] {
  try {
    const raw = localStorage.getItem(RECENT_SIGNATURES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RecentSignature[]) : [];
  } catch {
    return [];
  }
}

function saveRecentSignatures(signatures: RecentSignature[]): void {
  try {
    localStorage.setItem(RECENT_SIGNATURES_KEY, JSON.stringify(signatures.slice(0, MAX_RECENT_SIGNATURES)));
  } catch {
    // Storage full or unavailable (private browsing) — reuse just won't persist. Not worth surfacing.
  }
}

/* ------------------------------------------------------------------ */
/* PDF rendering + text extraction                                      */
/* ------------------------------------------------------------------ */

/** A single blank white pixel, stretched to fill the frame by CSS — see the `<img>` below. */
const BLANK_PAGE_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

async function renderPagesToImages(bytes: ArrayBuffer): Promise<{ pages: RenderedPage[]; textRuns: TextRun[] }> {
  const { doc, pageCount, close } = await openPdf(bytes);
  const pages: RenderedPage[] = [];
  const textRuns: TextRun[] = [];

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

      // getTextContent() returns coordinates already in PDF user space
      // (bottom-left origin, unscaled) — the same convention every
      // annotation here uses, so no conversion is needed. Extracted once up
      // front for both Find & Replace and the existing-text patch pipeline
      // (design doc §3) rather than re-parsed per search or per click.
      const content = await page.getTextContent();
      for (const item of content.items) {
        if (!("str" in item) || !item.str.trim()) continue;
        const height = (item.height as number) || 10;
        const transform = item.transform as number[];
        // Rotated/skewed text has non-zero b/c components; axis-aligned
        // horizontal text (the overwhelming common case) has b = c ≈ 0.
        const rotated = Math.abs(transform[1] ?? 0) > 0.01 || Math.abs(transform[2] ?? 0) > 0.01;
        textRuns.push({
          page: n,
          str: item.str,
          x: item.transform[4] as number,
          y: (item.transform[5] as number) - height * 0.2,
          width: item.width as number,
          height,
          fontFamilyHint: content.styles[item.fontName]?.fontFamily ?? "",
          rotated,
        });
      }

      page.cleanup();
      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    await close();
  }

  return { pages, textRuns };
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

function formFieldKindFromTool(tool: EditorTool): FormFieldKind | null {
  if (!tool.startsWith("form-")) return null;
  return tool.slice("form-".length) as FormFieldKind;
}

const FORM_FIELD_DEFAULT_NAME: Record<FormFieldKind, string> = {
  text: "Text field",
  multiline: "Text field",
  dropdown: "Dropdown",
  checkbox: "Checkbox",
  radio: "Radio Group",
};

/** Checkbox/radio are click-to-place at a fixed size, matching how every real PDF form uses them — not drag-to-size like a text field. */
const FORM_TOGGLE_SIZE = 16;

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
/* Editor page list — page order/structure, derived from pageOrder      */
/* ------------------------------------------------------------------ */

export interface EditorPage {
  /** The value stored in `Annotation.page` for anything placed on this page — an original page number, or a blank slot's synthetic negative id. */
  target: number;
  /** 1-based position for "Page N" labels — independent of `target` so deletes/inserts don't leave gaps in what the user sees. */
  displayNumber: number;
  rotation: 0 | 90 | 180 | 270;
  render: RenderedPage;
}

function buildEditorPages(pageOrder: PageSlot[], pages: RenderedPage[]): EditorPage[] {
  const out: EditorPage[] = [];
  pageOrder.forEach((slot, i) => {
    if (slot.kind === "original") {
      const src = pages.find((p) => p.pageNumber === slot.pageNumber);
      if (!src) return;
      out.push({ target: slot.pageNumber, displayNumber: i + 1, rotation: slot.rotationDelta, render: src });
    } else {
      out.push({
        target: slot.id,
        displayNumber: i + 1,
        rotation: 0,
        render: {
          pageNumber: slot.id,
          screenWidth: slot.width * RENDER_SCALE,
          screenHeight: slot.height * RENDER_SCALE,
          pdfWidth: slot.width,
          pdfHeight: slot.height,
          dataUrl: BLANK_PAGE_DATA_URL,
        },
      });
    }
  });
  return out;
}

/* ------------------------------------------------------------------ */
/* Editor                                                               */
/* ------------------------------------------------------------------ */

export default function EditPdf() {
  const { files, add, clear } = useFileList();
  const getBytes = useFileBytes();
  const { busy, error, results, run } = useProcessor();

  // Sejda's "Apply changes" flow downloads the finished file as soon as it's
  // ready, no extra click — ours used to stop at a "PDF saved" note with a
  // separate Download button. Auto-trigger the download the moment a new
  // result lands (the live editor canvas underneath already *is* the
  // preview — it keeps showing exactly what was just applied), while still
  // leaving the manual Download button as a way to re-save it again.
  const autoDownloadedRef = useRef<unknown>(null);
  useEffect(() => {
    const result = results[0];
    if (result && autoDownloadedRef.current !== result) {
      autoDownloadedRef.current = result;
      downloadResult(result);
    }
  }, [results]);

  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [pageOrder, setPageOrder] = useState<PageSlot[]>([]);
  const [textRuns, setTextRuns] = useState<TextRun[]>([]);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const nextBlankId = useRef(-1);

  // Sejda's editor opens with its "Text" tool active by default (click any
  // existing text to edit it, click blank space to place new text) — Select
  // is something you switch to deliberately to move/resize other elements.
  const [tool, setTool] = useState<EditorTool>("text");
  const [color, setColor] = useState<string>(COLORS[1]!);
  const [highlightColor, setHighlightColor] = useState<string>(HIGHLIGHT_COLORS[0]!);
  const [fontSize, setFontSize] = useState<number>(DEFAULT_FONT_SIZE);
  const [strokeWidth, setStrokeWidth] = useState<number>(DEFAULT_STROKE_WIDTH);
  const [shapeStrokeColor, setShapeStrokeColor] = useState<string>(COLORS[0]!);
  const [shapeFillColor, setShapeFillColor] = useState<string | null>(null);
  const [markupColor, setMarkupColor] = useState<string>(COLORS[1]!);
  const [zoom, setZoom] = useState(1);

  const [history, setHistory] = useState<History>(() => newHistory());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [signatures, setSignatures] = useState<RecentSignature[]>(() => loadRecentSignatures());
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);

  const [findOpen, setFindOpen] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchIndex, setMatchIndex] = useState(0);
  const [replacedKeys, setReplacedKeys] = useState<Set<string>>(new Set());

  const annotations = history.present;
  const file = files[0];

  const editorPages = useMemo(() => buildEditorPages(pageOrder, pages), [pageOrder, pages]);

  const setAnnotations = useCallback((updater: (current: Annotation[]) => Annotation[]) => {
    setHistory((h) => commit(h, updater(h.present)));
  }, []);

  const addAnnotation = useCallback(
    (annotation: Annotation) => {
      setAnnotations((current) => [...current, annotation]);
      setSelectedId(annotation.id);
      if (annotation.type === "text") setEditingTextId(annotation.id);
      // A tool placed something while annotations were hidden — show it,
      // otherwise the thing that was just added appears to have done nothing.
      setShowAnnotations(true);
    },
    [setAnnotations],
  );

  const addAnnotations = useCallback(
    (added: Annotation[]) => {
      if (added.length === 0) return;
      setAnnotations((current) => [...current, ...added]);
      setShowAnnotations(true);
    },
    [setAnnotations],
  );

  /**
   * The existing-text patch pipeline's commit step (design doc §3 point 3):
   * a cover annotation plus a text annotation, added as one undo step, with
   * the text one immediately opened for editing — the same "click, then
   * type" feel as placing brand new text, just seeded with what was already
   * there instead of starting blank.
   */
  const addTextPatch = useCallback(
    (cover: WhiteoutAnnotation, text: TextAnnotation) => {
      setAnnotations((current) => [...current, cover, text]);
      setSelectedId(text.id);
      setEditingTextId(text.id);
      setShowAnnotations(true);
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
      setPageOrder([]);
      setTextRuns([]);
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
        setPages(rendered.pages);
        setTextRuns(rendered.textRuns);
        setPageOrder(rendered.pages.map((p) => ({ kind: "original", pageNumber: p.pageNumber, rotationDelta: 0 })));
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
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setFindOpen(true);
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

  /* -------- visible page detection -------- */

  /** Returns the editor page currently most visible in the viewport, falling back to the first page. */
  function getVisiblePage(): EditorPage | undefined {
    let best: EditorPage | undefined;
    let bestRatio = -1;
    for (const ep of editorPages) {
      const el = document.querySelector(`[data-page-target="${ep.target}"]`);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(window.innerHeight, rect.bottom);
      const ratio = rect.height > 0 ? Math.max(0, visibleBottom - visibleTop) / rect.height : 0;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        best = ep;
      }
    }
    return best ?? editorPages[0];
  }

  /* -------- image insert -------- */

  async function insertImage(imgFile: File) {
    const targetPage = getVisiblePage();
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
        page: targetPage.target,
        type: "image",
        x: (targetPage.render.pdfWidth - w) / 2,
        y: (targetPage.render.pdfHeight - h) / 2,
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

  /* -------- signatures -------- */

  function placeSignature(sig: RecentSignature) {
    const targetPage = getVisiblePage();
    if (!targetPage) return;
    const MAX_PT = 180;
    const scale = Math.min(MAX_PT / sig.width, MAX_PT / sig.height, 1);
    const w = sig.width * scale;
    const h = sig.height * scale;
    const ann: SignatureAnnotation = {
      id: newAnnotationId(),
      page: targetPage.target,
      type: "signature",
      x: (targetPage.render.pdfWidth - w) / 2,
      y: (targetPage.render.pdfHeight - h) / 2,
      width: w,
      height: h,
      dataUrl: sig.dataUrl,
      format: "png",
    };
    addAnnotation(ann);
  }

  function confirmNewSignature(result: SignatureResult) {
    setSignatureModalOpen(false);
    const recent: RecentSignature = { id: newAnnotationId(), dataUrl: result.dataUrl, width: result.width, height: result.height };
    setSignatures((current) => {
      const next = [recent, ...current].slice(0, MAX_RECENT_SIGNATURES);
      saveRecentSignatures(next);
      return next;
    });
    placeSignature(recent);
  }

  /* -------- page structure: delete / rotate / insert -------- */

  function deletePage(target: number) {
    setPageOrder((current) => current.filter((s) => (s.kind === "original" ? s.pageNumber : s.id) !== target));
    setAnnotations((current) => current.filter((a) => a.page !== target));
    setSelectedId((cur) => {
      const stillSelected = cur && annotations.find((a) => a.id === cur);
      return stillSelected && stillSelected.page === target ? null : cur;
    });
  }

  function rotatePage(target: number, delta: 90 | -90) {
    setPageOrder((current) =>
      current.map((s) => {
        if (s.kind !== "original" || s.pageNumber !== target) return s;
        const next = (((s.rotationDelta + delta) % 360) + 360) % 360;
        return { ...s, rotationDelta: next as 0 | 90 | 180 | 270 };
      }),
    );
  }

  function insertBlankAfter(target: number) {
    const ref = editorPages.find((p) => p.target === target);
    const width = ref?.render.pdfWidth ?? 612;
    const height = ref?.render.pdfHeight ?? 792;
    const blankId = nextBlankId.current--;
    setPageOrder((current) => {
      const index = current.findIndex((s) => (s.kind === "original" ? s.pageNumber : s.id) === target);
      const next = [...current];
      next.splice(index + 1, 0, { kind: "blank", id: blankId, width, height });
      return next;
    });
  }

  /* -------- find & replace -------- */

  const allMatches = useMemo(() => findMatches(textRuns, findQuery), [textRuns, findQuery]);
  const matchKey = (m: TextMatch) => `${m.page}-${m.runIndex}-${m.start}`;
  const activeMatches = useMemo(() => allMatches.filter((m) => !replacedKeys.has(matchKey(m))), [allMatches, replacedKeys]);
  const currentMatch = activeMatches[Math.min(matchIndex, activeMatches.length - 1)];

  useEffect(() => {
    setMatchIndex(0);
    setReplacedKeys(new Set());
  }, [findQuery]);

  useEffect(() => {
    if (!currentMatch) return;
    const el = document.querySelector(`[data-page-target="${currentMatch.page}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentMatch]);

  function replaceMatch(match: TextMatch): Annotation[] {
    const whiteout: WhiteoutAnnotation = {
      id: newAnnotationId(),
      page: match.page,
      type: "whiteout",
      x: match.x,
      y: match.y,
      width: match.width,
      height: match.height,
    };
    const text: TextAnnotation = {
      id: newAnnotationId(),
      page: match.page,
      type: "text",
      x: match.x,
      y: match.y + match.height,
      text: replaceText,
      fontSize: Math.max(6, match.height * 0.9),
      color: "#000000",
    };
    return [whiteout, text];
  }

  function replaceCurrent() {
    if (!currentMatch) return;
    addAnnotations(replaceMatch(currentMatch));
    setReplacedKeys((cur) => new Set(cur).add(matchKey(currentMatch)));
  }

  function replaceAll() {
    if (activeMatches.length === 0) return;
    const added = activeMatches.flatMap(replaceMatch);
    addAnnotations(added);
    setReplacedKeys((cur) => {
      const next = new Set(cur);
      activeMatches.forEach((m) => next.add(matchKey(m)));
      return next;
    });
  }

  /* -------- save -------- */

  async function save() {
    if (!pdfBytes || !file) return;
    // Commit any in-progress text edits by unfocusing them.
    setEditingTextId(null);

    await run(async () => {
      const data = await flattenAnnotations(pdfBytes.slice(0), annotations, pageOrder);
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

  const thumbnailEntries: ThumbnailEntry[] = editorPages.map((p) => ({
    target: p.target,
    displayNumber: p.displayNumber,
    dataUrl: p.render.dataUrl === BLANK_PAGE_DATA_URL ? null : p.render.dataUrl,
    rotation: p.rotation,
  }));

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
          markupColor={markupColor}
          onMarkupColorChange={setMarkupColor}
          onInsertImage={insertImage}
          signatures={signatures}
          onPlaceSignature={placeSignature}
          onNewSignature={() => setSignatureModalOpen(true)}
          showAnnotations={showAnnotations}
          onToggleShowAnnotations={() => setShowAnnotations((v) => !v)}
          onOpenFind={() => setFindOpen(true)}
          showThumbnails={showThumbnails}
          onToggleThumbnails={() => setShowThumbnails((v) => !v)}
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

        {findOpen && (
          <FindReplacePanel
            query={findQuery}
            onQueryChange={setFindQuery}
            replacement={replaceText}
            onReplacementChange={setReplaceText}
            matchCount={activeMatches.length}
            currentIndex={activeMatches.length ? Math.min(matchIndex, activeMatches.length - 1) : -1}
            onNext={() => setMatchIndex((i) => (activeMatches.length ? (i + 1) % activeMatches.length : 0))}
            onPrev={() => setMatchIndex((i) => (activeMatches.length ? (i - 1 + activeMatches.length) % activeMatches.length : 0))}
            onReplace={replaceCurrent}
            onReplaceAll={replaceAll}
            onClose={() => setFindOpen(false)}
          />
        )}

        <div className="pdfed__body">
          {showThumbnails && (
            <PageThumbnails
              entries={thumbnailEntries}
              activeTarget={currentMatch?.page ?? null}
              onJump={(target) => document.querySelector(`[data-page-target="${target}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
              onDelete={deletePage}
              onClose={() => setShowThumbnails(false)}
            />
          )}

          <div className="pdfed__viewport">
            {editorPages.map((ep) => (
              <PageEditor
                key={ep.target}
                page={ep.render}
                displayNumber={ep.displayNumber}
                rotation={ep.rotation}
                zoom={zoom}
                canDeletePage={editorPages.length > 1}
                onDeletePage={() => deletePage(ep.target)}
                onRotateLeft={() => rotatePage(ep.target, -90)}
                onRotateRight={() => rotatePage(ep.target, 90)}
                onInsertPageAfter={() => insertBlankAfter(ep.target)}
                onZoomIn={() => setZoom((z) => Math.min(2, +(z + 0.25).toFixed(2)))}
                onZoomOut={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                activeMatch={currentMatch && currentMatch.page === ep.target ? currentMatch : null}
                textRuns={textRuns.filter((r) => r.page === ep.target)}
                onAddTextPatch={addTextPatch}
                annotations={annotations.filter((a) => a.page === ep.target)}
                tool={tool}
                color={color}
                highlightColor={highlightColor}
                fontSize={fontSize}
                strokeWidth={strokeWidth}
                shapeStrokeColor={shapeStrokeColor}
                shapeFillColor={shapeFillColor}
                markupColor={markupColor}
                showAnnotations={showAnnotations}
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
        </div>

        {imageError && <Note kind="error">{imageError}</Note>}
        {error && <Note kind="error">{error}</Note>}

        {results.length > 0 && results[0] && (
          <Note kind="success">
            PDF saved — {results[0].name} downloaded.{" "}
            <button type="button" onClick={() => downloadResult(results[0]!)} className="pdfed__download">
              Download again
            </button>
          </Note>
        )}
      </div>

      {signatureModalOpen && <SignatureModal onClose={() => setSignatureModalOpen(false)} onConfirm={confirmNewSignature} />}
    </PdfTool>
  );
}

/* ------------------------------------------------------------------ */
/* Page editor                                                          */
/* ------------------------------------------------------------------ */

interface PageEditorProps {
  page: RenderedPage;
  displayNumber: number;
  rotation: 0 | 90 | 180 | 270;
  zoom: number;
  canDeletePage: boolean;
  onDeletePage: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onInsertPageAfter: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  activeMatch: TextMatch | null;
  textRuns: TextRun[];
  onAddTextPatch: (cover: WhiteoutAnnotation, text: TextAnnotation) => void;
  annotations: Annotation[];
  tool: EditorTool;
  color: string;
  highlightColor: string;
  fontSize: number;
  strokeWidth: number;
  shapeStrokeColor: string;
  shapeFillColor: string | null;
  markupColor: string;
  showAnnotations: boolean;
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
  | {
      kind: "box";
      tool: "highlight" | "whiteout" | "link" | "shape" | "strikeout" | "underline" | "form";
      shapeKind?: ShapeKind;
      formKind?: FormFieldKind;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    };

function PageEditor(props: PageEditorProps) {
  const {
    page,
    displayNumber,
    rotation,
    zoom,
    canDeletePage,
    onDeletePage,
    onRotateLeft,
    onRotateRight,
    onInsertPageAfter,
    onZoomIn,
    onZoomOut,
    activeMatch,
    textRuns,
    onAddTextPatch,
    annotations,
    tool,
    color,
    highlightColor,
    fontSize,
    strokeWidth,
    shapeStrokeColor,
    shapeFillColor,
    markupColor,
    showAnnotations,
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
  const imgRef = useRef<HTMLImageElement>(null);
  const [drawing, setDrawing] = useState<Drawing | null>(null);

  // getAnnotationScreenBox() (and everything derived from it, like the
  // floating ElementToolbar's position) works in the SVG's nominal
  // viewBox units (page.screenWidth/Height) — correct for anything drawn
  // *inside* the SVG, since the browser's own viewBox transform scales
  // those to real pixels automatically. ElementToolbar is a plain HTML
  // <div> outside the SVG, positioned via raw left/top, so it needs that
  // same nominal-to-real conversion done by hand — get the pointer
  // handlers above already do this per-event via a fresh
  // getBoundingClientRect(); this tracks the same ratio in state (via
  // ResizeObserver, so it stays correct across window resizes and the
  // page frame's own responsive max-width:100% shrinking — see
  // .pdfed__pageframe in EditPdf.css) for use during render, where
  // per-event math isn't available. Without this, the toolbar renders in
  // the wrong place whenever the frame isn't shown at exactly its nominal
  // pixel size (confirmed: reported as the toolbar overlapping the text
  // it belongs to, at any width where the page is scaled down).
  const [frameScale, setFrameScale] = useState(1);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const update = () => {
      const width = svg.getBoundingClientRect().width;
      if (width > 0) setFrameScale(width / page.screenWidth);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(svg);
    return () => ro.disconnect();
  }, [page.screenWidth]);

  function getPointerPos(e: ReactPointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * page.screenWidth;
    const sy = ((e.clientY - rect.top) / rect.height) * page.screenHeight;
    return { sx, sy };
  }

  function addFormField(centerSx: number, centerSy: number, kind: FormFieldKind, boxOverride?: { x: number; y: number; width: number; height: number }) {
    const box =
      boxOverride ??
      (() => {
        const half = FORM_TOGGLE_SIZE / 2;
        const topLeft = screenToPdf(page, centerSx - half, centerSy - half);
        return { x: topLeft.x, y: topLeft.y - FORM_TOGGLE_SIZE, width: FORM_TOGGLE_SIZE, height: FORM_TOGGLE_SIZE };
      })();
    const id = newAnnotationId();
    const ann: FormFieldAnnotation = {
      id,
      page: page.pageNumber,
      type: "form-field",
      ...box,
      kind,
      name: FORM_FIELD_DEFAULT_NAME[kind],
      ...(kind === "dropdown" ? { options: ["Option 1", "Option 2"] } : {}),
      ...(kind === "radio" ? { radioValue: id } : {}),
    };
    onAdd(ann);
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

      // Clicking on top of text the PDF already has starts the
      // existing-text patch flow (design doc §3) instead of placing a new,
      // separate text box — the same "click text, start typing" gesture a
      // real editor has, best-effort-faked with a cover + a matched-font
      // overlay since the original glyphs can't safely be rewritten.
      const run = findRunAt(textRuns, page.pageNumber, pdf.x, pdf.y);
      if (run) {
        const standardFont = matchStandardFont(run.fontFamilyHint);
        const { textColor, backgroundColor } = imgRef.current
          ? sampleRunColors(imgRef.current, page, run)
          : { textColor: "#000000", backgroundColor: "#FFFFFF" };

        const cover: WhiteoutAnnotation = {
          id: newAnnotationId(),
          page: page.pageNumber,
          type: "whiteout",
          x: run.x,
          y: run.y,
          width: run.width,
          height: run.height,
          color: backgroundColor,
        };
        const text: TextAnnotation = {
          id: newAnnotationId(),
          page: page.pageNumber,
          type: "text",
          x: run.x,
          y: run.y + run.height,
          text: run.str,
          fontSize: Math.max(6, Math.round(run.height)),
          color: textColor,
          fontFamily: standardFont,
          coverId: cover.id,
        };
        onAddTextPatch(cover, text);
        return;
      }

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

    if (tool === "highlight" || tool === "whiteout" || tool === "link" || tool === "strikeout" || tool === "underline") {
      setDrawing({ kind: "box", tool, startX: pos.sx, startY: pos.sy, endX: pos.sx, endY: pos.sy });
      return;
    }

    const shapeKind = shapeKindFromTool(tool);
    if (shapeKind) {
      setDrawing({ kind: "box", tool: "shape", shapeKind, startX: pos.sx, startY: pos.sy, endX: pos.sx, endY: pos.sy });
      return;
    }

    const formKind = formFieldKindFromTool(tool);
    if (formKind === "checkbox" || formKind === "radio") {
      // Fixed-size, click-to-place — see FORM_TOGGLE_SIZE.
      addFormField(pos.sx, pos.sy, formKind);
      return;
    }
    if (formKind) {
      setDrawing({ kind: "box", tool: "form", formKind, startX: pos.sx, startY: pos.sy, endX: pos.sx, endY: pos.sy });
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
      } else if (drawing.tool === "strikeout" || drawing.tool === "underline") {
        const ann: MarkupAnnotation = { id: newAnnotationId(), page: page.pageNumber, type: drawing.tool, ...box, color: markupColor };
        onAdd(ann);
      } else if (drawing.tool === "form" && drawing.formKind) {
        addFormField(0, 0, drawing.formKind, box);
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

  const selected = showAnnotations && selectedId ? annotations.find((a) => a.id === selectedId) : undefined;
  const activeMatchBox = activeMatch ? pdfToScreen(page, activeMatch.x, activeMatch.y + activeMatch.height) : null;

  return (
    <div className="pdfed__page" data-page-target={page.pageNumber} style={{ width: page.screenWidth * zoom }}>
      <PageChrome
        displayNumber={displayNumber}
        rotation={rotation}
        canDelete={canDeletePage}
        zoom={zoom}
        onDelete={onDeletePage}
        onRotateLeft={onRotateLeft}
        onRotateRight={onRotateRight}
        onInsertAfter={onInsertPageAfter}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
      />
      <div
        className="pdfed__pageframe"
        style={{ width: page.screenWidth * zoom, aspectRatio: `${page.screenWidth} / ${page.screenHeight}` }}
      >
        <img ref={imgRef} src={page.dataUrl} alt={`Page ${displayNumber}`} className="pdfed__pageimg" draggable={false} />
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
          {showAnnotations &&
            annotations.map((ann) => (
              <AnnotationView
                key={ann.id}
                annotation={ann}
                page={page}
                svgRef={svgRef}
                selected={selectedId === ann.id}
                editing={editingTextId === ann.id}
                tool={tool}
                onSelect={onSelect}
                onStartEditingText={onStartEditingText}
                onStopEditingText={onStopEditingText}
                onUpdate={onUpdate}
              />
            ))}

          {activeMatchBox && activeMatch && (
            <rect
              x={activeMatchBox.sx}
              y={activeMatchBox.sy}
              width={activeMatch.width * RENDER_SCALE}
              height={activeMatch.height * RENDER_SCALE}
              fill="none"
              stroke="#F59E0B"
              strokeWidth={2}
              pointerEvents="none"
              className="pdfed__match-ring"
            />
          )}

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
                      : drawing.tool === "strikeout" || drawing.tool === "underline"
                        ? markupColor
                        : drawing.tool === "form"
                          ? "#EDF0FF"
                          : (shapeFillColor ?? "transparent")
              }
              fillOpacity={
                drawing.tool === "highlight"
                  ? HIGHLIGHT_OPACITY
                  : drawing.tool === "shape"
                    ? 1
                    : drawing.tool === "strikeout" || drawing.tool === "underline"
                      ? 0.15
                      : 0.5
              }
              stroke={
                drawing.tool === "shape"
                  ? shapeStrokeColor
                  : drawing.tool === "link"
                    ? "var(--accent)"
                    : drawing.tool === "form"
                      ? "#6B72E6"
                      : "none"
              }
              strokeWidth={drawing.tool === "shape" ? DEFAULT_SHAPE_STROKE_WIDTH * RENDER_SCALE : 1.5}
              strokeDasharray={drawing.tool === "link" || drawing.tool === "form" ? "4 3" : undefined}
            />
          )}
        </svg>

        {selected && (
          <ElementToolbar
            box={scaleScreenBox(getAnnotationScreenBox(page, selected), frameScale)}
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
            {selected.type === "form-field" && (
              <input
                type="text"
                className="pdfed__link-input"
                placeholder="Field name…"
                defaultValue={selected.name}
                onPointerDown={(e) => e.stopPropagation()}
                onChange={(e) => onUpdate(selected.id, { name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              />
            )}
            {selected.type === "text" && (
              <TextToolbarControls
                annotation={selected}
                cover={selected.coverId ? (annotations.find((a) => a.id === selected.coverId) as WhiteoutAnnotation | undefined) : undefined}
                onUpdate={onUpdate}
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
