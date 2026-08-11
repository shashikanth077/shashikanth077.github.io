import { useState } from "react";
import { flipPdf, type FlipDirection } from "@devtools/tools-core";
import { Button, Field, FileDrop, Panel, Select, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";

export default function FlipPdf() {
  const { files, replace, clear } = useFileList();
  const getBytes = useFileBytes();
  const processor = useProcessor();
  const [direction, setDirection] = useState<FlipDirection>("horizontal");

  const file = files[0];

  async function apply() {
    if (!file) return;
    await processor.run(async () => {
      const bytes = await getBytes(file);
      const data = await flipPdf(bytes, direction);
      const name = file.file.name.replace(/\.pdf$/i, "-flipped.pdf");
      return [{ name, blob: new Blob([data as BlobPart], { type: "application/pdf" }) }];
    });
  }

  return (
    <PdfTool slug="flip-pdf">
      <FileDrop accept={[".pdf"]} multiple={false} onFiles={replace} label="Drop a PDF here to flip its pages" disabled={processor.busy} />

      {file && (
        <Panel title={file.file.name}>
          <div className="dt-stack">
            <Field label="Direction">
              {(id) => (
                <Select id={id} value={direction} onChange={(e) => setDirection(e.target.value as FlipDirection)}>
                  <option value="horizontal">Horizontal (mirror left ↔ right)</option>
                  <option value="vertical">Vertical (mirror top ↕ bottom)</option>
                </Select>
              )}
            </Field>

            <div className="dt-row">
              <Button variant="primary" onClick={apply} disabled={processor.busy}>
                {processor.busy ? "Flipping…" : "Flip PDF"}
              </Button>
              <Button onClick={clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="flipped-pdf.zip" />
    </PdfTool>
  );
}
