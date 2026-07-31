import { useEffect, useState } from "react";
import { imagesToPdf, imageToPngBytes, type PageSizeName } from "@devtools/tools-core";
import { Button, Field, FileDrop, FileList, Panel, Select, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useProcessor } from "../shared.js";

export default function ImagesToPdf() {
  const list = useFileList();
  const processor = useProcessor();
  const [pageSize, setPageSize] = useState<PageSizeName>("a4");
  const [fit, setFit] = useState<"fit" | "actual">("fit");

  // Thumbnails for the file list.
  useEffect(() => {
    list.files.forEach((file) => {
      if (file.previewUrl) return;
      list.setPreview(file.id, URL.createObjectURL(file.file));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.files.length]);

  async function build() {
    await processor.run(async (report) => {
      const images: Array<{ bytes: ArrayBuffer; type: string }> = [];

      for (const [i, file] of list.files.entries()) {
        const isNative = /png|jpe?g/.test(file.file.type);
        // pdf-lib embeds only PNG and JPEG — anything else goes through canvas.
        images.push(
          isNative
            ? { bytes: await file.file.arrayBuffer(), type: file.file.type }
            : { bytes: await imageToPngBytes(file.file), type: "image/png" },
        );
        report(i + 1, list.files.length + 1);
      }

      const pdf = await imagesToPdf(images, { pageSize, fit });
      report(list.files.length + 1, list.files.length + 1);

      return [
        {
          name: "images.pdf",
          blob: new Blob([pdf as BlobPart], { type: "application/pdf" }),
          note: `${images.length} page${images.length === 1 ? "" : "s"}`,
        },
      ];
    });
  }

  return (
    <PdfTool slug="images-to-pdf">
      <FileDrop
        accept={["image/*"]}
        onFiles={list.add}
        label="Drop images here"
        hint="JPG, PNG, WebP, AVIF · one image per page, in the order listed"
        disabled={processor.busy}
      />

      {list.files.length > 0 && (
        <Panel title={`${list.files.length} image${list.files.length === 1 ? "" : "s"}`}>
          <div className="dt-stack">
            <FileList files={list.files} onRemove={list.remove} onMove={list.move} reorderable />

            <div className="dt-row">
              <Field label="Page size">
                {(id) => (
                  <Select
                    id={id}
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as PageSizeName)}
                  >
                    <option value="a4">A4</option>
                    <option value="letter">US Letter</option>
                    <option value="auto">Match each image</option>
                  </Select>
                )}
              </Field>
              <Field label="Scaling">
                {(id) => (
                  <Select id={id} value={fit} onChange={(e) => setFit(e.target.value as "fit" | "actual")}>
                    <option value="fit">Fit to page</option>
                    <option value="actual">Actual size</option>
                  </Select>
                )}
              </Field>
            </div>

            <div className="dt-row">
              <Button variant="primary" onClick={build} disabled={processor.busy}>
                {processor.busy ? "Building…" : "Create PDF"}
              </Button>
              <Button onClick={list.clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="images-pdf.zip" />
    </PdfTool>
  );
}
