import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "@devtools/ui";
import { HANDWRITING_STYLES, handwritingFont, type HandwritingStyle } from "./handwritingStyles.js";

export const SIGNATURE_COLORS = ["#1D4ED8", "#1E3A8A", "#3730A3", "#111827", "#374151", "#4B5563", "#000000"];

export interface SignatureResult {
  dataUrl: string;
  width: number;
  height: number;
  format: "png";
}

type Tab = "type" | "draw" | "upload";

export function SignatureModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (result: SignatureResult) => void;
}) {
  const [tab, setTab] = useState<Tab>("type");

  // Type tab state
  const [name, setName] = useState("Your Name");
  const [color, setColor] = useState(SIGNATURE_COLORS[0]!);
  const [style, setStyle] = useState<HandwritingStyle>(HANDWRITING_STYLES[0]!);

  // Draw tab state
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const [hasDrawing, setHasDrawing] = useState(false);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // Upload tab state
  const [uploaded, setUploaded] = useState<{ dataUrl: string; width: number; height: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function clearDrawCanvas() {
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
  }

  function canvasPoint(e: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = drawCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function onDrawPointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    lastPoint.current = canvasPoint(e);
  }

  function onDrawPointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    const point = canvasPoint(e);
    if (!ctx || !point || !lastPoint.current) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPoint.current = point;
    setHasDrawing(true);
  }

  function onDrawPointerUp() {
    drawing.current = false;
    lastPoint.current = null;
  }

  function onUploadFile(file: File) {
    setUploadError(null);
    const reader = new FileReader();
    reader.onerror = () => setUploadError("Could not read that file.");
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => setUploadError("That file doesn't look like a valid image.");
      img.onload = () => setUploaded({ dataUrl, width: img.naturalWidth || 300, height: img.naturalHeight || 150 });
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function confirmType() {
    const trimmed = name.trim() || "Signature";
    const sizePx = 64;
    const measure = document.createElement("canvas").getContext("2d")!;
    measure.font = handwritingFont(style, sizePx);
    const textWidth = Math.ceil(measure.measureText(trimmed).width);

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(120, textWidth + 40);
    canvas.height = sizePx * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.font = handwritingFont(style, sizePx);
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.fillText(trimmed, 20, canvas.height / 2);

    onConfirm({ dataUrl: canvas.toDataURL("image/png"), width: canvas.width, height: canvas.height, format: "png" });
  }

  function confirmDraw() {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    onConfirm({ dataUrl: canvas.toDataURL("image/png"), width: canvas.width, height: canvas.height, format: "png" });
  }

  function confirmUpload() {
    if (!uploaded) return;
    onConfirm({ dataUrl: uploaded.dataUrl, width: uploaded.width, height: uploaded.height, format: "png" });
  }

  const canConfirm = tab === "type" ? name.trim().length > 0 : tab === "draw" ? hasDrawing : !!uploaded;
  const confirm = tab === "type" ? confirmType : tab === "draw" ? confirmDraw : confirmUpload;

  return (
    <div className="pdfed__modal-backdrop" onClick={onClose}>
      <div className="pdfed__modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Create signature">
        <div className="pdfed__modal-head">
          <h3>Create signature</h3>
          <button type="button" className="pdfed__modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="pdfed__modal-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "type"} className={`pdfed__modal-tab${tab === "type" ? " pdfed__modal-tab--active" : ""}`} onClick={() => setTab("type")}>
            Type
          </button>
          <button type="button" role="tab" aria-selected={tab === "draw"} className={`pdfed__modal-tab${tab === "draw" ? " pdfed__modal-tab--active" : ""}`} onClick={() => setTab("draw")}>
            Draw
          </button>
          <button type="button" role="tab" aria-selected={tab === "upload"} className={`pdfed__modal-tab${tab === "upload" ? " pdfed__modal-tab--active" : ""}`} onClick={() => setTab("upload")}>
            Upload Image
          </button>
        </div>

        {tab === "type" && (
          <div className="pdfed__modal-body">
            <input
              type="text"
              className="pdfed__sig-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type your name"
              maxLength={40}
              autoFocus
            />
            <div className="pdfed__sig-colors">
              {SIGNATURE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`pdfed__swatch${color === c ? " pdfed__swatch--active" : ""}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                  aria-label={`Ink ${c}`}
                  aria-pressed={color === c}
                />
              ))}
            </div>
            <div className="pdfed__sig-styles">
              {HANDWRITING_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`pdfed__sig-style${style.id === s.id ? " pdfed__sig-style--active" : ""}`}
                  onClick={() => setStyle(s)}
                >
                  <span
                    style={{
                      fontFamily: s.fontFamily,
                      fontStyle: s.fontStyle ?? "normal",
                      fontWeight: s.fontWeight ?? 400,
                      letterSpacing: s.letterSpacing,
                      color,
                    }}
                  >
                    {name.trim() || "Your Name"}
                  </span>
                  <em>{s.label}</em>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "draw" && (
          <div className="pdfed__modal-body">
            <div className="pdfed__sig-colors">
              {SIGNATURE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`pdfed__swatch${color === c ? " pdfed__swatch--active" : ""}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                  aria-label={`Ink ${c}`}
                  aria-pressed={color === c}
                />
              ))}
              <Button variant="ghost" onClick={clearDrawCanvas}>
                Clear
              </Button>
            </div>
            <canvas
              ref={drawCanvasRef}
              className="pdfed__sig-canvas"
              width={640}
              height={220}
              onPointerDown={onDrawPointerDown}
              onPointerMove={onDrawPointerMove}
              onPointerUp={onDrawPointerUp}
              onPointerCancel={onDrawPointerUp}
            />
            <p className="pdfed__sig-hint">Draw your signature with your mouse, trackpad, or finger.</p>
          </div>
        )}

        {tab === "upload" && (
          <div className="pdfed__modal-body">
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadFile(file);
              }}
            />
            {uploadError && <p className="pdfed__sig-hint pdfed__sig-hint--error">{uploadError}</p>}
            {uploaded && (
              <div className="pdfed__sig-upload-preview">
                <img src={uploaded.dataUrl} alt="Signature preview" />
              </div>
            )}
          </div>
        )}

        <div className="pdfed__modal-foot">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirm} disabled={!canConfirm}>
            Add signature
          </Button>
        </div>
      </div>
    </div>
  );
}
