import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from "react";
import type { AnnotationTool, ShapeKind } from "@devtools/tools-core";
import { Button } from "@devtools/ui";
import { COLORS, HIGHLIGHT_COLORS, SHAPE_KINDS } from "./constants.js";
import {
  ArrowIcon,
  ChevronDownIcon,
  EllipseIcon,
  HighlightIcon,
  ImageIcon,
  LineIcon,
  LinkIcon,
  PenIcon,
  RectangleIcon,
  RedoIcon,
  SelectIcon,
  ShapesIcon,
  TextIcon,
  UndoIcon,
  WhiteoutIcon,
} from "./icons.js";

export type EditorTool = "select" | AnnotationTool;

const SHAPE_ICONS: Record<ShapeKind, (p: { size?: number }) => ReactNode> = {
  rectangle: RectangleIcon,
  ellipse: EllipseIcon,
  line: LineIcon,
  arrow: ArrowIcon,
};

export interface ToolbarProps {
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

  shapeStrokeColor: string;
  onShapeStrokeColorChange: (color: string) => void;
  shapeFillColor: string | null;
  onShapeFillColorChange: (color: string | null) => void;

  onInsertImage: (file: File) => void;

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

export function Toolbar(props: ToolbarProps) {
  const imageInputRef = useRef<ImageInputHandle>(null);

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
        <ToolButton current={props.tool} value="link" onClick={props.onToolChange} label="Links">
          <LinkIcon />
        </ToolButton>
        <ToolButton
          current={props.tool}
          value="image"
          onClick={() => imageInputRef.current?.pick()}
          label="Images — insert a new image"
        >
          <ImageIcon />
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
        <ToolButton current={props.tool} value="whiteout" onClick={props.onToolChange} label="Whiteout">
          <WhiteoutIcon />
        </ToolButton>

        <ToolbarDropdown
          label="Shapes"
          trigger={<ShapesIcon />}
          active={props.tool.startsWith("shape-")}
        >
          {(close) =>
            SHAPE_KINDS.map(({ kind, label }) => {
              const Icon = SHAPE_ICONS[kind];
              const value: EditorTool = `shape-${kind}`;
              return (
                <button
                  key={kind}
                  type="button"
                  className="pdfed__dropdown-item"
                  onClick={() => {
                    props.onToolChange(value);
                    close();
                  }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              );
            })
          }
        </ToolbarDropdown>
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

      {props.tool.startsWith("shape-") && (
        <div className="pdfed__toolbar-group">
          <span className="pdfed__toolbar-label">Stroke</span>
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`pdfed__swatch${props.shapeStrokeColor === c ? " pdfed__swatch--active" : ""}`}
              style={{ background: c }}
              onClick={() => props.onShapeStrokeColorChange(c)}
              aria-label={`Stroke ${c}`}
              aria-pressed={props.shapeStrokeColor === c}
            />
          ))}
          {(props.tool === "shape-rectangle" || props.tool === "shape-ellipse") && (
            <>
              <span className="pdfed__toolbar-label">Fill</span>
              <button
                type="button"
                className={`pdfed__swatch pdfed__swatch--none${props.shapeFillColor === null ? " pdfed__swatch--active" : ""}`}
                onClick={() => props.onShapeFillColorChange(null)}
                aria-label="No fill"
                aria-pressed={props.shapeFillColor === null}
              />
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`pdfed__swatch${props.shapeFillColor === c ? " pdfed__swatch--active" : ""}`}
                  style={{ background: c }}
                  onClick={() => props.onShapeFillColorChange(c)}
                  aria-label={`Fill ${c}`}
                  aria-pressed={props.shapeFillColor === c}
                />
              ))}
            </>
          )}
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
          <UndoIcon size={14} />
        </button>
        <button
          type="button"
          className="pdfed__iconbtn"
          onClick={props.onRedo}
          disabled={!props.canRedo}
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
        >
          <RedoIcon size={14} />
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
          {props.saving ? "Saving…" : "Apply changes"}
        </Button>
      </div>

      <ImageFileInput ref={imageInputRef} onPick={props.onInsertImage} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tool button                                                         */
/* ------------------------------------------------------------------ */

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
  children: ReactNode;
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
/* Dropdown — click trigger, panel below, closes on outside click/Escape */
/* ------------------------------------------------------------------ */

function ToolbarDropdown({
  label,
  trigger,
  active,
  children,
}: {
  label: string;
  trigger: ReactNode;
  active?: boolean;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="pdfed__dropdown-root" ref={rootRef}>
      <button
        type="button"
        className={`pdfed__toolbtn${active ? " pdfed__toolbtn--active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        title={label}
        aria-label={label}
        aria-expanded={open}
      >
        {trigger}
        <ChevronDownIcon size={10} />
      </button>
      {open && <div className="pdfed__dropdown">{children(() => setOpen(false))}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hidden file input for "Images" — click opens the OS picker directly  */
/* ------------------------------------------------------------------ */

interface ImageInputHandle {
  pick: () => void;
}

const ImageFileInput = forwardRef<ImageInputHandle, { onPick: (file: File) => void }>(
  function ImageFileInput({ onPick }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({ pick: () => inputRef.current?.click() }), []);

    return (
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="pdfed__hidden-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = "";
        }}
      />
    );
  },
);
