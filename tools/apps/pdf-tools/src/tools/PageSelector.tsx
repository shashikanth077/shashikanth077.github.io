import { useEffect, useState } from "react";
import { baseName, extractPages, readPdfInfo, removePages, rotatePdf } from "@devtools/tools-core";
import { Button, FileDrop, Note, Panel, Select, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";

/**
 * Backs both "Delete PDF Pages" and "Rotate PDF" — the two tools share a page
 * picker and differ only in what they do with the selection, so they share a
 * component rather than duplicating the grid and its selection logic.
 */
export function PageSelectorTool({ slug }: { slug: "remove-pdf-pages" | "rotate-pdf" }) {
  const isRotate = slug === "rotate-pdf";
  const list = useFileList();
  const readBytes = useFileBytes();
  const processor = useProcessor();

  const [pageCount, setPageCount] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [action, setAction] = useState<"remove" | "keep">("remove");
  const [turn, setTurn] = useState<90 | 180 | 270>(90);

  const file = list.files[0];

  useEffect(() => {
    setSelected(new Set());
    if (!file) {
      setPageCount(0);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const info = await readPdfInfo(await readBytes(file));
        if (!cancelled) setPageCount(info.pageCount);
      } catch (err) {
        if (!cancelled) {
          setPageCount(0);
          processor.setError(err instanceof Error ? err.message : String(err));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, readBytes]);

  function toggle(index: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  async function apply() {
    if (!file) return;
    const indices = [...selected].sort((a, b) => a - b);
    const stem = baseName(file.name);

    await processor.run(async (report) => {
      const bytes = await readBytes(file);
      report(1, 2);

      let out: Uint8Array;
      let name: string;

      if (isRotate) {
        out = await rotatePdf(bytes, turn, indices.length ? indices : undefined);
        name = `${stem}-rotated.pdf`;
      } else if (action === "keep") {
        if (indices.length === 0) throw new Error("Select at least one page to keep.");
        out = await extractPages(bytes, indices);
        name = `${stem}-selected.pdf`;
      } else {
        if (indices.length === 0) throw new Error("Select at least one page to remove.");
        out = await removePages(bytes, indices);
        name = `${stem}-trimmed.pdf`;
      }

      report(2, 2);
      return [{ name, blob: new Blob([out as BlobPart], { type: "application/pdf" }) }];
    });
  }

  return (
    <PdfTool slug={slug}>
      <FileDrop
        accept={[".pdf", "application/pdf"]}
        onFiles={list.replace}
        multiple={false}
        label="Drop a PDF here"
        hint="One PDF"
        disabled={processor.busy}
      />

      {pageCount > 0 && (
        <Panel
          title={`${pageCount} pages · ${selected.size} selected`}
          actions={
            <>
              <Button
                variant="quiet"
                onClick={() => setSelected(new Set(Array.from({ length: pageCount }, (_, i) => i)))}
              >
                Select all
              </Button>
              <Button variant="quiet" onClick={() => setSelected(new Set())} disabled={selected.size === 0}>
                Clear selection
              </Button>
            </>
          }
        >
          <div className="dt-stack">
            <ul className="dt-pagegrid">
              {Array.from({ length: pageCount }, (_, i) => (
                <li key={i}>
                  <button
                    type="button"
                    className={`dt-pagechip${selected.has(i) ? " dt-pagechip--on" : ""}`}
                    onClick={() => toggle(i)}
                    aria-pressed={selected.has(i)}
                    aria-label={`Page ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>

            {isRotate ? (
              <>
                <div className="dt-row">
                  <Select
                    value={String(turn)}
                    onChange={(e) => setTurn(Number(e.target.value) as 90 | 180 | 270)}
                    aria-label="Rotation"
                    style={{ width: "auto" }}
                  >
                    <option value="90">Rotate 90° clockwise</option>
                    <option value="180">Rotate 180°</option>
                    <option value="270">Rotate 90° anticlockwise</option>
                  </Select>
                </div>
                <Note kind="info">
                  With nothing selected, every page is rotated. Rotation adds to whatever the page
                  already had.
                </Note>
              </>
            ) : (
              <div className="dt-row">
                <Button
                  variant={action === "remove" ? "primary" : "ghost"}
                  onClick={() => setAction("remove")}
                  aria-pressed={action === "remove"}
                >
                  Remove selected
                </Button>
                <Button
                  variant={action === "keep" ? "primary" : "ghost"}
                  onClick={() => setAction("keep")}
                  aria-pressed={action === "keep"}
                >
                  Keep only selected
                </Button>
              </div>
            )}

            <div className="dt-row">
              <Button variant="primary" onClick={apply} disabled={processor.busy}>
                {processor.busy ? "Working…" : isRotate ? "Rotate" : "Apply"}
              </Button>
              <Button onClick={list.clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="pages.zip" />
    </PdfTool>
  );
}

export function RemovePdfPages() {
  return <PageSelectorTool slug="remove-pdf-pages" />;
}

export function RotatePdf() {
  return <PageSelectorTool slug="rotate-pdf" />;
}
