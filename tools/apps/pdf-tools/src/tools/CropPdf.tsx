import { useEffect, useState } from "react";
import { cropPdf, readPdfInfo, renderFirstPage, type CropMargins } from "@devtools/tools-core";
import { Button, Field, FileDrop, Panel, TextInput, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";

const ZERO: CropMargins = { top: 0, right: 0, bottom: 0, left: 0 };

export default function CropPdf() {
  const { files, replace, clear } = useFileList();
  const getBytes = useFileBytes();
  const processor = useProcessor();

  const [margins, setMargins] = useState<CropMargins>(ZERO);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<{ width: number; height: number } | null>(null);

  const file = files[0];

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setPageSize(null);
      return;
    }
    let cancelled = false;
    let url: string | null = null;
    (async () => {
      const bytes = await getBytes(file);
      const info = await readPdfInfo(bytes);
      const firstPage = info.pages[0];
      if (!cancelled && firstPage) setPageSize({ width: firstPage.width, height: firstPage.height });
      url = await renderFirstPage(bytes, 1);
      if (!cancelled) setPreviewUrl(url);
      else if (url) URL.revokeObjectURL(url);
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file?.id]);

  function set(key: keyof CropMargins, value: number) {
    setMargins((cur) => ({ ...cur, [key]: Math.max(0, value) }));
  }

  async function apply() {
    if (!file) return;
    await processor.run(async () => {
      const bytes = await getBytes(file);
      const data = await cropPdf(bytes, margins);
      const name = file.file.name.replace(/\.pdf$/i, "-cropped.pdf");
      return [{ name, blob: new Blob([data as BlobPart], { type: "application/pdf" }) }];
    });
  }

  const pct = pageSize
    ? {
        top: (margins.top / pageSize.height) * 100,
        bottom: (margins.bottom / pageSize.height) * 100,
        left: (margins.left / pageSize.width) * 100,
        right: (margins.right / pageSize.width) * 100,
      }
    : null;

  return (
    <PdfTool slug="crop-pdf">
      <FileDrop accept={[".pdf"]} multiple={false} onFiles={replace} label="Drop a PDF here to crop its pages" disabled={processor.busy} />

      {file && (
        <Panel title={file.file.name}>
          <div className="dt-stack">
            {previewUrl && pct && (
              <div style={{ position: "relative", maxWidth: "18rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                <img src={previewUrl} alt="First page preview" style={{ display: "block", width: "100%" }} />
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: `${pct.top}%`,
                    left: `${pct.left}%`,
                    right: `${pct.right}%`,
                    bottom: `${pct.bottom}%`,
                    border: "2px dashed var(--accent)",
                    background: "rgba(0,0,0,0.05)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            )}

            <p style={{ fontSize: "0.8125rem", color: "var(--text-soft)" }}>Margins in points (72pt = 1 inch), trimmed from each edge of every page.</p>

            <div className="dt-row">
              <Field label="Top">
                {(id) => <TextInput id={id} type="number" min={0} value={margins.top} onChange={(e) => set("top", Number(e.target.value))} />}
              </Field>
              <Field label="Right">
                {(id) => <TextInput id={id} type="number" min={0} value={margins.right} onChange={(e) => set("right", Number(e.target.value))} />}
              </Field>
              <Field label="Bottom">
                {(id) => <TextInput id={id} type="number" min={0} value={margins.bottom} onChange={(e) => set("bottom", Number(e.target.value))} />}
              </Field>
              <Field label="Left">
                {(id) => <TextInput id={id} type="number" min={0} value={margins.left} onChange={(e) => set("left", Number(e.target.value))} />}
              </Field>
            </div>

            <div className="dt-row">
              <Button variant="primary" onClick={apply} disabled={processor.busy}>
                {processor.busy ? "Cropping…" : "Crop PDF"}
              </Button>
              <Button onClick={clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="cropped-pdf.zip" />
    </PdfTool>
  );
}
