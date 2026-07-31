import { useEffect, useState } from "react";
import { baseName, readPdfInfo, splitEveryPage, splitIntoRanges } from "@devtools/tools-core";
import { Button, Field, FileDrop, Note, Panel, TextInput, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";

type Mode = "ranges" | "every";

export default function SplitPdf() {
  const list = useFileList();
  const readBytes = useFileBytes();
  const processor = useProcessor();

  const [mode, setMode] = useState<Mode>("ranges");
  const [spec, setSpec] = useState("1-3, 4-6");
  const [pageCount, setPageCount] = useState<number | null>(null);

  const file = list.files[0];

  useEffect(() => {
    if (!file) {
      setPageCount(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const info = await readPdfInfo(await readBytes(file));
        if (!cancelled) setPageCount(info.pageCount);
      } catch {
        if (!cancelled) setPageCount(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file, readBytes]);

  async function split() {
    if (!file || !pageCount) return;
    const stem = baseName(file.name);

    await processor.run(async (report) => {
      const bytes = await readBytes(file);
      report(1, 2);

      const parts =
        mode === "every"
          ? await splitEveryPage(bytes)
          : await splitIntoRanges(
              bytes,
              spec.split(",").map((s) => s.trim()).filter(Boolean),
              pageCount,
            );

      report(2, 2);
      return parts.map((part) => ({
        name: `${stem}-${part.name}`,
        blob: new Blob([part.data as BlobPart], { type: "application/pdf" }),
      }));
    });
  }

  return (
    <PdfTool slug="split-pdf">
      <FileDrop
        accept={[".pdf", "application/pdf"]}
        onFiles={list.replace}
        multiple={false}
        label="Drop a PDF here"
        hint="One PDF to split"
        disabled={processor.busy}
      />

      {file && (
        <Panel title={`${file.name}${pageCount ? ` · ${pageCount} pages` : ""}`}>
          <div className="dt-stack">
            <div className="dt-row">
              <Button
                variant={mode === "ranges" ? "primary" : "ghost"}
                onClick={() => setMode("ranges")}
                aria-pressed={mode === "ranges"}
              >
                By ranges
              </Button>
              <Button
                variant={mode === "every" ? "primary" : "ghost"}
                onClick={() => setMode("every")}
                aria-pressed={mode === "every"}
              >
                Every page separately
              </Button>
            </div>

            {mode === "ranges" ? (
              <Field
                label="Ranges — one output file per comma-separated entry"
                hint={
                  pageCount
                    ? `e.g. "1-3, 4-6, 7" makes three files. Pages 1-${pageCount}.`
                    : "e.g. 1-3, 4-6, 7"
                }
              >
                {(id) => (
                  <TextInput id={id} value={spec} onChange={(e) => setSpec(e.target.value)} />
                )}
              </Field>
            ) : (
              <Note kind="info">
                Produces {pageCount ?? "one"} separate PDF{pageCount === 1 ? "" : "s"}, one per page.
              </Note>
            )}

            <div className="dt-row">
              <Button variant="primary" onClick={split} disabled={!pageCount || processor.busy}>
                {processor.busy ? "Splitting…" : "Split PDF"}
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
        zipName={file ? `${baseName(file.name)}-split.zip` : "split.zip"}
      />
    </PdfTool>
  );
}
