import { baseName, extractImages } from "@devtools/tools-core";
import { Button, FileDrop, Note, Panel, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";

export default function ExtractImagesPdf() {
  const { files, replace, clear } = useFileList();
  const getBytes = useFileBytes();
  const processor = useProcessor();

  const file = files[0];

  async function extract() {
    if (!file) return;
    const stem = baseName(file.file.name);

    await processor.run(async () => {
      const bytes = await getBytes(file);
      const { images, skipped } = await extractImages(bytes);
      if (images.length === 0) {
        throw new Error(
          skipped > 0
            ? `Found ${skipped} image${skipped === 1 ? "" : "s"}, but none in a supported encoding (JPEG only for now).`
            : "No embedded images found in this PDF.",
        );
      }

      return images.map((img) => {
        const blob = new Blob([img.data as BlobPart], { type: "image/jpeg" });
        return {
          name: `${stem}-p${String(img.pageNumber).padStart(3, "0")}-${img.index}.jpg`,
          blob,
          url: URL.createObjectURL(blob),
          note: img.width && img.height ? `${img.width}×${img.height} · page ${img.pageNumber}` : `page ${img.pageNumber}`,
        };
      });
    });
  }

  return (
    <PdfTool slug="extract-pdf-images">
      <FileDrop accept={[".pdf"]} multiple={false} onFiles={replace} label="Drop a PDF here to extract its images" disabled={processor.busy} />

      {file && (
        <Panel title={file.file.name}>
          <div className="dt-stack">
            <Note kind="info">Extracts JPEG-encoded images at their original quality — the most common case for scans and photos. Other encodings (JPEG2000, raw bitmaps) aren't supported yet.</Note>
            <div className="dt-row">
              <Button variant="primary" onClick={extract} disabled={processor.busy}>
                {processor.busy ? "Extracting…" : "Extract Images"}
              </Button>
              <Button onClick={clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName={file ? `${baseName(file.file.name)}-images.zip` : "extracted-images.zip"} />
    </PdfTool>
  );
}
