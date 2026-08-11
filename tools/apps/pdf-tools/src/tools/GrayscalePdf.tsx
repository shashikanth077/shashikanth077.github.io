import { useState } from "react";
import { grayscalePdf } from "@devtools/tools-core";
import { Button, FileDrop, Note, Panel, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";

export default function GrayscalePdf() {
  const { files, replace, clear } = useFileList();
  const getBytes = useFileBytes();
  const processor = useProcessor();
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const file = files[0];

  async function apply() {
    if (!file) return;
    setProgress(null);
    await processor.run(async () => {
      const bytes = await getBytes(file);
      const data = await grayscalePdf(bytes, {}, (done, total) => setProgress({ done, total }));
      setProgress(null);
      const name = file.file.name.replace(/\.pdf$/i, "-grayscale.pdf");
      return [{ name, blob: new Blob([data as BlobPart], { type: "application/pdf" }) }];
    });
  }

  return (
    <PdfTool slug="grayscale-pdf">
      <FileDrop accept={[".pdf"]} multiple={false} onFiles={replace} label="Drop a PDF here to convert it to grayscale" disabled={processor.busy} />

      {file && (
        <Panel title={file.file.name}>
          <div className="dt-stack">
            <Note kind="info">Every page is rasterised and desaturated, then rebuilt as a PDF — text stops being selectable, the same tradeoff Compress PDF makes.</Note>

            {progress && (
              <p style={{ fontSize: "0.875rem", color: "var(--text-soft)" }}>
                Converting page {progress.done} of {progress.total}…
              </p>
            )}

            <div className="dt-row">
              <Button variant="primary" onClick={apply} disabled={processor.busy}>
                {processor.busy ? "Converting…" : "Convert to Grayscale"}
              </Button>
              <Button onClick={clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="grayscale-pdf.zip" />
    </PdfTool>
  );
}
