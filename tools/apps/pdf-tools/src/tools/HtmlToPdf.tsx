import { useState } from "react";
import { baseName, htmlFileToPdfHtml, htmlToPdfBlob, printHtmlToPdf } from "@devtools/tools-core";
import { Button, FileDrop, Note, Panel, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";

export default function HtmlToPdf() {
  const { files, replace, clear } = useFileList();
  const getBytes = useFileBytes();
  const processor = useProcessor();
  const [prepared, setPrepared] = useState<{ html: string; stem: string } | null>(null);

  const file = files[0];

  async function apply() {
    if (!file) return;
    const stem = baseName(file.file.name);
    setPrepared(null);

    await processor.run(async () => {
      const bytes = await getBytes(file);
      const rawHtml = new TextDecoder().decode(bytes);
      const { html } = htmlFileToPdfHtml(rawHtml);
      setPrepared({ html, stem });

      const pdf = await htmlToPdfBlob(html);
      return [{ name: `${stem}.pdf`, blob: pdf, note: "rasterised" }];
    });
  }

  return (
    <PdfTool slug="html-to-pdf">
      <FileDrop accept={[".html", ".htm", "text/html"]} multiple={false} onFiles={replace} label="Drop an .html file here" disabled={processor.busy} />

      {file && (
        <Panel title={file.file.name}>
          <div className="dt-stack">
            <div className="dt-row">
              <Button variant="primary" onClick={apply} disabled={processor.busy}>
                {processor.busy ? "Converting…" : "Convert to PDF"}
              </Button>
              {prepared && (
                <Button onClick={() => printHtmlToPdf(prepared.html, prepared.stem)}>Print to PDF (better quality)</Button>
              )}
              <Button onClick={clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
            <Note kind="info">
              <strong>Two ways to get a PDF.</strong> The download button rasterises the page — it looks right but the text becomes an
              image. <strong>Print to PDF</strong> hands the document to your browser&rsquo;s own print engine, which produces real
              selectable, searchable text; you choose &ldquo;Save as PDF&rdquo; as the destination. Scripts in the file don&rsquo;t run
              either way — only markup and styling are used.
            </Note>
          </div>
        </Panel>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="html-to-pdf.zip" />
    </PdfTool>
  );
}
