import { useState } from "react";
import { baseName, pdfToImages } from "@devtools/tools-core";
import { Button, Field, FileDrop, Panel, Progress, Select, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";

const SCALES = [
  { value: "1", label: "72 dpi — screen" },
  { value: "2", label: "144 dpi — good default" },
  { value: "3", label: "216 dpi — print" },
  { value: "4", label: "288 dpi — large files" },
];

export default function PdfToImages() {
  const list = useFileList();
  const readBytes = useFileBytes();
  const processor = useProcessor();

  const [scale, setScale] = useState(2);
  const [format, setFormat] = useState<"image/png" | "image/jpeg">("image/png");

  const file = list.files[0];

  async function convert() {
    if (!file) return;
    const stem = baseName(file.name);
    const extension = format === "image/png" ? "png" : "jpg";

    await processor.run(async (report) => {
      const pages = await pdfToImages(
        await readBytes(file),
        { scale, type: format, quality: 0.92 },
        report,
      );

      return pages.map((page) => ({
        name: `${stem}-page-${String(page.pageNumber).padStart(3, "0")}.${extension}`,
        blob: page.blob,
        url: page.url,
        note: `${page.width}×${page.height}`,
      }));
    });
  }

  return (
    <PdfTool slug="pdf-to-images">
      <FileDrop
        accept={[".pdf", "application/pdf"]}
        onFiles={list.replace}
        multiple={false}
        label="Drop a PDF here"
        hint="Every page becomes an image"
        disabled={processor.busy}
      />

      {file && (
        <Panel title={file.name}>
          <div className="dt-stack">
            <div className="dt-row">
              <Field label="Resolution">
                {(id) => (
                  <Select id={id} value={String(scale)} onChange={(e) => setScale(Number(e.target.value))}>
                    {SCALES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Format" hint={format === "image/png" ? "Lossless, larger" : "Smaller, slight loss"}>
                {(id) => (
                  <Select
                    id={id}
                    value={format}
                    onChange={(e) => setFormat(e.target.value as typeof format)}
                  >
                    <option value="image/png">PNG</option>
                    <option value="image/jpeg">JPEG</option>
                  </Select>
                )}
              </Field>
            </div>

            {processor.progress && (
              <Progress
                value={processor.progress.done}
                total={processor.progress.total}
                label={`Rendering page ${processor.progress.done} of ${processor.progress.total}`}
              />
            )}

            <div className="dt-row">
              <Button variant="primary" onClick={convert} disabled={processor.busy}>
                {processor.busy ? "Rendering…" : "Convert to images"}
              </Button>
              <Button onClick={list.clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <ProcessorOutput
        error={processor.error}
        results={processor.results}
        zipName={file ? `${baseName(file.name)}-images.zip` : "images.zip"}
      />
    </PdfTool>
  );
}
