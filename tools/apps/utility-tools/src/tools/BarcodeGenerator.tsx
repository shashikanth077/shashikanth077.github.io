import { useEffect, useMemo, useRef, useState } from "react";
import { findSymbology, renderBarcodeToCanvas, SYMBOLOGIES } from "@devtools/tools-core";
import {
  Button,
  Checkbox,
  Field,
  Note,
  Panel,
  Select,
  TextInput,
  ToolFrame,
  useDebounced,
} from "@devtools/ui";

export default function BarcodeGenerator() {
  const [symbologyId, setSymbologyId] = useState("code128");
  const [text, setText] = useState("DEVTOOLS-2026");
  const [scale, setScale] = useState(3);
  const [height, setHeight] = useState(12);
  const [includeText, setIncludeText] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const symbology = findSymbology(symbologyId);
  const debouncedText = useDebounced(text, 200);

  // Pre-validate so the common mistakes produce a helpful message rather than
  // bwip-js's raw "bwipp.ean13badLength" style error.
  const validationError = useMemo(() => {
    if (!debouncedText) return null;
    return symbology?.validate?.(debouncedText) ?? null;
  }, [symbology, debouncedText]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!debouncedText || validationError) {
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      setRenderError(null);
      return;
    }

    try {
      renderBarcodeToCanvas(canvas, symbologyId, debouncedText, { scale, height, includeText });
      setRenderError(null);
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : String(err));
    }
  }, [debouncedText, symbologyId, scale, height, includeText, validationError]);

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = `barcode-${symbologyId}.png`;
    anchor.click();
  }

  const canRender = Boolean(debouncedText) && !validationError && !renderError;

  return (
    <ToolFrame
      title="Barcode Generator"
      tagline="Create Code 128, EAN, UPC, ITF-14 and Code 39 linear barcodes."
    >
      <div className="dt-split dt-split--wide-right">
        <Panel title="Options">
          <div className="dt-stack">
            <Field label="Symbology" hint={symbology?.hint}>
              {(id) => (
                <Select id={id} value={symbologyId} onChange={(e) => setSymbologyId(e.target.value)}>
                  {SYMBOLOGIES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field label="Value">
              {(id) => (
                <TextInput
                  id={id}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  invalid={Boolean(validationError)}
                  aria-describedby={validationError ? `${id}-error` : undefined}
                />
              )}
            </Field>

            <Field label="Scale" hint={`${scale}× — module width`}>
              {(id) => (
                <input
                  id={id}
                  type="range"
                  min={1}
                  max={8}
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--accent)" }}
                />
              )}
            </Field>

            <Field label="Bar height" hint={`${height} mm`}>
              {(id) => (
                <input
                  id={id}
                  type="range"
                  min={5}
                  max={40}
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--accent)" }}
                />
              )}
            </Field>

            <Checkbox label="Print value below bars" checked={includeText} onChange={setIncludeText} />
          </div>
        </Panel>

        <Panel
          title="Barcode"
          flush
          actions={
            <Button variant="quiet" onClick={downloadPng} disabled={!canRender}>
              Download PNG
            </Button>
          }
        >
          <div className="dt-canvas-frame" style={{ background: "#ffffff" }}>
            {canRender ? (
              <canvas ref={canvasRef} aria-label={`${symbology?.label} barcode`} />
            ) : (
              <p className="dt-empty" style={{ color: "#767E85" }}>
                {validationError ? "Fix the value to render." : "Enter a value to generate a barcode."}
              </p>
            )}
          </div>
        </Panel>
      </div>

      {validationError ? <Note kind="error">{validationError}</Note> : null}
      {renderError ? <Note kind="error">Could not render: {renderError}</Note> : null}

      <Note kind="info">
        Barcodes render on a white background regardless of theme — scanners need the contrast, and
        a dark-mode barcode will not read.
      </Note>
    </ToolFrame>
  );
}
