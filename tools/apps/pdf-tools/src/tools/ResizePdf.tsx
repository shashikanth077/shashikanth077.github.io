import { useState } from "react";
import { resizePdf, type ResizeOptions, type StandardPageSize } from "@devtools/tools-core";
import { Button, Field, FileDrop, Panel, Select, TextInput, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";

type SizeChoice = StandardPageSize | "custom";

export default function ResizePdf() {
  const { files, replace, clear } = useFileList();
  const getBytes = useFileBytes();
  const processor = useProcessor();

  const [size, setSize] = useState<SizeChoice>("a4");
  const [customWidth, setCustomWidth] = useState(612);
  const [customHeight, setCustomHeight] = useState(792);
  const [scaling, setScaling] = useState<ResizeOptions["scaling"]>("fit");

  const file = files[0];

  async function apply() {
    if (!file) return;
    await processor.run(async () => {
      const bytes = await getBytes(file);
      const data = await resizePdf(bytes, { size, customWidth, customHeight, scaling });
      const name = file.file.name.replace(/\.pdf$/i, "-resized.pdf");
      return [{ name, blob: new Blob([data as BlobPart], { type: "application/pdf" }) }];
    });
  }

  return (
    <PdfTool slug="resize-pdf">
      <FileDrop accept={[".pdf"]} multiple={false} onFiles={replace} label="Drop a PDF here to resize its pages" disabled={processor.busy} />

      {file && (
        <Panel title={file.file.name}>
          <div className="dt-stack">
            <div className="dt-row">
              <Field label="New page size">
                {(id) => (
                  <Select id={id} value={size} onChange={(e) => setSize(e.target.value as SizeChoice)}>
                    <option value="a4">A4</option>
                    <option value="letter">US Letter</option>
                    <option value="legal">US Legal</option>
                    <option value="custom">Custom</option>
                  </Select>
                )}
              </Field>
              <Field label="Scaling">
                {(id) => (
                  <Select id={id} value={scaling} onChange={(e) => setScaling(e.target.value as ResizeOptions["scaling"])}>
                    <option value="fit">Fit (keep aspect ratio)</option>
                    <option value="stretch">Stretch to fill</option>
                  </Select>
                )}
              </Field>
            </div>

            {size === "custom" && (
              <div className="dt-row">
                <Field label="Width (points)" hint="72pt = 1 inch">
                  {(id) => <TextInput id={id} type="number" min={1} value={customWidth} onChange={(e) => setCustomWidth(Number(e.target.value))} />}
                </Field>
                <Field label="Height (points)">
                  {(id) => <TextInput id={id} type="number" min={1} value={customHeight} onChange={(e) => setCustomHeight(Number(e.target.value))} />}
                </Field>
              </div>
            )}

            <div className="dt-row">
              <Button variant="primary" onClick={apply} disabled={processor.busy}>
                {processor.busy ? "Resizing…" : "Resize PDF"}
              </Button>
              <Button onClick={clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="resized-pdf.zip" />
    </PdfTool>
  );
}
