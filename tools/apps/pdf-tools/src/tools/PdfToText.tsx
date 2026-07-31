import { useState } from "react";
import {
  baseName,
  extractedPagesToPlainText,
  looksScanned,
  paragraphsToDocx,
  pdfToText,
  type ExtractedPage,
} from "@devtools/tools-core";
import {
  Button,
  CopyButton,
  FileDrop,
  Note,
  Panel,
  Progress,
  StatRow,
  useFileList,
} from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";

/**
 * Backs both "PDF to Text" and "PDF to Word" — identical extraction, different
 * output format. Keeping them in one component means the (fiddly) paragraph
 * reconstruction and the scanned-PDF warning stay in a single place.
 */
export function PdfExtractTool({ slug }: { slug: "pdf-to-text" | "pdf-to-word" }) {
  const asWord = slug === "pdf-to-word";
  const list = useFileList();
  const readBytes = useFileBytes();
  const processor = useProcessor();

  const [pages, setPages] = useState<ExtractedPage[]>([]);
  const file = list.files[0];

  const plainText = pages.length ? extractedPagesToPlainText(pages) : "";
  const scanned = pages.length > 0 && looksScanned(pages);
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;

  async function extract() {
    if (!file) return;
    const stem = baseName(file.name);
    setPages([]);

    await processor.run(async (report) => {
      const extracted = await pdfToText(await readBytes(file), report);
      setPages(extracted);

      if (looksScanned(extracted)) {
        throw new Error(
          "Almost no text was found. This is very likely a scanned PDF — the pages are images, " +
            "and extracting their text needs OCR, which this tool does not do.",
        );
      }

      if (asWord) {
        const blob = await paragraphsToDocx(extracted, { title: stem });
        return [{ name: `${stem}.docx`, blob, note: `${extracted.length} pages` }];
      }

      const text = extractedPagesToPlainText(extracted);
      return [
        {
          name: `${stem}.txt`,
          blob: new Blob([text], { type: "text/plain;charset=utf-8" }),
          note: `${extracted.length} pages`,
        },
      ];
    });
  }

  return (
    <PdfTool slug={slug}>
      <FileDrop
        accept={[".pdf", "application/pdf"]}
        onFiles={(files) => {
          setPages([]);
          list.replace(files);
        }}
        multiple={false}
        label="Drop a PDF here"
        hint={asWord ? "Text is rebuilt as an editable .docx" : "Selectable text is extracted"}
        disabled={processor.busy}
      />

      {file && (
        <Panel title={file.name}>
          <div className="dt-stack">
            {processor.progress && (
              <Progress
                value={processor.progress.done}
                total={processor.progress.total}
                label={`Reading page ${processor.progress.done} of ${processor.progress.total}`}
              />
            )}
            <div className="dt-row">
              <Button variant="primary" onClick={extract} disabled={processor.busy}>
                {processor.busy ? "Extracting…" : asWord ? "Convert to Word" : "Extract text"}
              </Button>
              <Button onClick={list.clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {scanned && !processor.error && (
        <Note kind="warning">
          Very little text was found — this looks like a scanned document. The pages are images, so
          there is nothing to extract without OCR.
        </Note>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="extracted.zip" />

      {plainText && (
        <>
          <StatRow
            items={[
              { label: "Pages", value: pages.length },
              { label: "Words", value: wordCount.toLocaleString() },
              { label: "Characters", value: plainText.length.toLocaleString() },
            ]}
          />
          <Panel title="Extracted text" flush actions={<CopyButton value={plainText} label="Copy all" />}>
            <pre className="dt-code" style={{ maxHeight: "26rem", overflow: "auto", whiteSpace: "pre-wrap" }}>
              {plainText}
            </pre>
          </Panel>
        </>
      )}
    </PdfTool>
  );
}

export function PdfToText() {
  return <PdfExtractTool slug="pdf-to-text" />;
}

export function PdfToWord() {
  return <PdfExtractTool slug="pdf-to-word" />;
}
