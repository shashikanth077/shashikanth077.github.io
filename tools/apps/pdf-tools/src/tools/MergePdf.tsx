import { useEffect, useState } from "react";
import { mergePdfs, readPdfInfo } from "@devtools/tools-core";
import { Button, FileDrop, FileList, Panel, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";

export default function MergePdf() {
  const list = useFileList();
  const readBytes = useFileBytes();
  const processor = useProcessor();

  // Page counts live here rather than on the file objects: previewUrl feeds an
  // <img src>, so putting non-URL text there renders a broken image.
  const [pageCounts, setPageCounts] = useState<Record<string, number | "error">>({});

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      for (const file of list.files) {
        if (pageCounts[file.id] !== undefined) continue;
        try {
          const info = await readPdfInfo(await readBytes(file));
          if (!cancelled) setPageCounts((c) => ({ ...c, [file.id]: info.pageCount }));
        } catch {
          if (!cancelled) setPageCounts((c) => ({ ...c, [file.id]: "error" }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.files]);

  const totalPages = list.files.reduce((sum, f) => {
    const count = pageCounts[f.id];
    return sum + (typeof count === "number" ? count : 0);
  }, 0);

  async function merge() {
    await processor.run(async (report) => {
      const buffers: ArrayBuffer[] = [];
      for (const [i, file] of list.files.entries()) {
        buffers.push(await readBytes(file));
        report(i + 1, list.files.length);
      }
      const merged = await mergePdfs(buffers);
      return [
        {
          name: "merged.pdf",
          blob: new Blob([merged as BlobPart], { type: "application/pdf" }),
          note: `${totalPages || "?"} pages`,
        },
      ];
    });
  }

  return (
    <PdfTool slug="merge-pdf">
      <FileDrop
        accept={[".pdf", "application/pdf"]}
        onFiles={list.add}
        label="Drop PDFs here"
        hint="Two or more PDFs · merged in the order listed below"
        disabled={processor.busy}
      />

      {list.files.length > 0 && (
        <Panel
          title={`${list.files.length} file${list.files.length === 1 ? "" : "s"}${
            totalPages ? ` · ${totalPages} pages total` : ""
          }`}
        >
          <FileList
            files={list.files}
            onRemove={list.remove}
            onMove={list.move}
            reorderable
            meta={(f) => {
              const count = pageCounts[f.id];
              if (count === undefined) return "reading…";
              if (count === "error") return "could not read";
              return `${count} page${count === 1 ? "" : "s"}`;
            }}
          />
          <div className="dt-row" style={{ marginTop: "var(--space-3)" }}>
            <Button variant="primary" onClick={merge} disabled={list.files.length < 2 || processor.busy}>
              {processor.busy ? "Merging…" : `Merge ${list.files.length} PDFs`}
            </Button>
            <Button onClick={list.clear} disabled={processor.busy}>
              Clear
            </Button>
          </div>
        </Panel>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="merged.zip" />
    </PdfTool>
  );
}
