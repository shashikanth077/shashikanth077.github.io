import { useState } from "react";
import { stampPages, type StampFontFamily, type StampPosition } from "@devtools/tools-core";
import { Button, Field, FileDrop, Panel, TextInput, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";
import { ColorField, FontFamilyField, FontSizeField, PageRangeField, PositionField } from "./stamp-controls.js";

export default function WatermarkPdf() {
  const { files, replace, clear } = useFileList();
  const getBytes = useFileBytes();
  const processor = useProcessor();

  const [text, setText] = useState("");
  const [position, setPosition] = useState<StampPosition>("center");
  const [fontFamily, setFontFamily] = useState<StampFontFamily>("Helvetica");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#ff0000");
  const [opacityPct, setOpacityPct] = useState(35);
  const [rotation, setRotation] = useState(45);
  const [pages, setPages] = useState("");

  const file = files[0];

  async function apply() {
    if (!file || !text.trim()) return;
    await processor.run(async () => {
      const bytes = await getBytes(file);
      const data = await stampPages(bytes, () => text, {
        position,
        fontFamily,
        fontSize,
        color,
        opacity: opacityPct / 100,
        rotation,
        pages,
      });
      const name = file.file.name.replace(/\.pdf$/i, "-watermarked.pdf");
      return [{ name, blob: new Blob([data as BlobPart], { type: "application/pdf" }) }];
    });
  }

  return (
    <PdfTool slug="watermark-pdf">
      <FileDrop accept={[".pdf"]} multiple={false} onFiles={replace} label="Drop a PDF here to add a watermark" disabled={processor.busy} />

      {file && (
        <Panel title={file.file.name}>
          <div className="dt-stack">
            <Field label="Watermark text" hint={'e.g. "CONFIDENTIAL", "DRAFT", "SAMPLE"'}>
              {(id) => <TextInput id={id} value={text} onChange={(e) => setText(e.target.value)} placeholder="CONFIDENTIAL" />}
            </Field>

            {text.trim() && (
              <div
                aria-hidden="true"
                style={{
                  padding: "var(--space-4)",
                  background: "var(--surface-alt)",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  textAlign: position.includes("left") ? "left" : position.includes("right") ? "right" : "center",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    fontFamily: fontFamily === "Times" ? "Times New Roman, Times, serif" : fontFamily === "Courier" ? "Courier New, monospace" : "Helvetica, Arial, sans-serif",
                    fontSize: `${Math.min(fontSize, 48)}px`,
                    color,
                    opacity: opacityPct / 100,
                    transform: `rotate(${-rotation}deg)`,
                  }}
                >
                  {text}
                </span>
              </div>
            )}

            <div className="dt-row">
              <PositionField value={position} onChange={setPosition} />
              <FontFamilyField value={fontFamily} onChange={setFontFamily} />
              <FontSizeField value={fontSize} onChange={setFontSize} />
              <ColorField value={color} onChange={setColor} />
            </div>

            <div className="dt-row">
              <Field label="Opacity" hint={`${opacityPct}%`}>
                {(id) => (
                  <input
                    id={id}
                    type="range"
                    min={5}
                    max={100}
                    value={opacityPct}
                    onChange={(e) => setOpacityPct(Number(e.target.value))}
                    className="dt-input"
                  />
                )}
              </Field>
              <Field label="Rotation" hint="degrees, counterclockwise">
                {(id) => (
                  <TextInput
                    id={id}
                    type="number"
                    min={-180}
                    max={180}
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                  />
                )}
              </Field>
              <PageRangeField value={pages} onChange={setPages} />
            </div>

            <div className="dt-row">
              <Button variant="primary" onClick={apply} disabled={processor.busy || !text.trim()}>
                {processor.busy ? "Watermarking…" : "Watermark PDF"}
              </Button>
              <Button onClick={clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="watermarked-pdf.zip" />
    </PdfTool>
  );
}
