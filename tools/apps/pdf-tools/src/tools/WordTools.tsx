import { useState } from "react";
import { baseName, docxToHtml, htmlToPdfBlob, printHtmlToPdf } from "@devtools/tools-core";
import { Button, CopyButton, FileDrop, Note, Panel, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useProcessor } from "../shared.js";

const DOCX_ACCEPT = [
  ".docx",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/**
 * Backs "Word to PDF" and "Word to HTML". Both start with the same mammoth
 * conversion; only the final step differs.
 */
export function WordTool({ slug }: { slug: "word-to-pdf" | "word-to-html" }) {
  const asPdf = slug === "word-to-pdf";
  const list = useFileList();
  const processor = useProcessor();

  const [html, setHtml] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const file = list.files[0];

  async function convert() {
    if (!file) return;
    const stem = baseName(file.name);
    setHtml("");
    setWarnings([]);

    await processor.run(async (report) => {
      report(1, asPdf ? 3 : 2);
      const result = await docxToHtml(await file.file.arrayBuffer());
      setHtml(result.html);
      setWarnings(result.warnings);
      report(2, asPdf ? 3 : 2);

      if (!asPdf) {
        return [
          {
            name: `${stem}.html`,
            blob: new Blob([wrapHtml(result.html, stem)], { type: "text/html;charset=utf-8" }),
          },
        ];
      }

      const pdf = await htmlToPdfBlob(result.html);
      report(3, 3);
      return [{ name: `${stem}.pdf`, blob: pdf, note: "rasterised" }];
    });
  }

  return (
    <PdfTool slug={slug}>
      <FileDrop
        accept={DOCX_ACCEPT}
        onFiles={(files) => {
          setHtml("");
          list.replace(files);
        }}
        multiple={false}
        label="Drop a Word document here"
        hint=".docx only — the older .doc format is not readable in a browser"
        disabled={processor.busy}
      />

      {file && (
        <Panel title={file.name}>
          <div className="dt-stack">
            <div className="dt-row">
              <Button variant="primary" onClick={convert} disabled={processor.busy}>
                {processor.busy ? "Converting…" : asPdf ? "Convert to PDF" : "Convert to HTML"}
              </Button>
              {asPdf && html && (
                <Button onClick={() => printHtmlToPdf(html, baseName(file.name))}>
                  Print to PDF (better quality)
                </Button>
              )}
              <Button onClick={list.clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>

            {asPdf && (
              <Note kind="info">
                <strong>Two ways to get a PDF.</strong> The download button rasterises the page — it
                looks right but the text becomes an image. <strong>Print to PDF</strong> hands the
                document to your browser&rsquo;s own print engine, which produces real selectable,
                searchable text; you choose &ldquo;Save as PDF&rdquo; as the destination.
              </Note>
            )}
          </div>
        </Panel>
      )}

      {warnings.length > 0 && (
        <Note kind="warning">
          <strong>{warnings.length} thing{warnings.length === 1 ? "" : "s"} could not be mapped cleanly:</strong>
          <ul style={{ margin: "0.4rem 0 0", paddingLeft: "1.1rem" }}>
            {warnings.slice(0, 6).map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </Note>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="converted.zip" />

      {html && (
        <Panel
          title="Preview"
          flush
          actions={<CopyButton value={html} label="Copy HTML" />}
        >
          <div
            className="dt-prose"
            style={{ maxHeight: "34rem", overflowY: "auto" }}
            // Safe: docxToHtml() returns DOMPurify-sanitised HTML.
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Panel>
      )}
    </PdfTool>
  );
}

function wrapHtml(body: string, title: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  body { font-family: Calibri, "Segoe UI", system-ui, sans-serif; line-height: 1.6;
         max-width: 46rem; margin: 2rem auto; padding: 0 1rem; color: #16181a; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
  img { max-width: 100%; height: auto; }
  blockquote { border-left: 3px solid #ddd; margin-left: 0; padding-left: 1rem; color: #444; }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

export function WordToPdf() {
  return <WordTool slug="word-to-pdf" />;
}

export function WordToHtml() {
  return <WordTool slug="word-to-html" />;
}
