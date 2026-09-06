import { useState } from "react";
import { csvToPdf, parseCsv } from "@devtools/tools-core";
import { Button, Checkbox, FileDrop, Note, Panel, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";

export default function CsvToPdf() {
  const { files, replace, clear } = useFileList();
  const getBytes = useFileBytes();
  const processor = useProcessor();
  const [hasHeader, setHasHeader] = useState(true);

  const file = files[0];

  async function apply() {
    if (!file) return;
    await processor.run(async () => {
      const bytes = await getBytes(file);
      const text = new TextDecoder().decode(bytes);
      const rows = parseCsv(text);
      if (rows.length === 0) throw new Error("This file has no rows to convert.");
      const data = await csvToPdf(rows, { hasHeader });
      const name = file.file.name.replace(/\.csv$/i, "") + ".pdf";
      return [{ name, blob: new Blob([data as BlobPart], { type: "application/pdf" }), note: `${rows.length} row${rows.length === 1 ? "" : "s"}` }];
    });
  }

  return (
    <PdfTool slug="csv-to-pdf">
      <FileDrop accept={[".csv", "text/csv"]} multiple={false} onFiles={replace} label="Drop a .csv file here" disabled={processor.busy} />

      {file && (
        <Panel title={file.file.name}>
          <div className="dt-stack">
            <Checkbox label="First row is a header (shown bold, repeated on every page)" checked={hasHeader} onChange={setHasHeader} />
            <Note kind="info">
              Columns split evenly across the page width. A value too long for its column is truncated with “…” — this is a simple grid layout,
              not a spreadsheet engine, so very wide or text-heavy CSVs will lose some content.
            </Note>
            <div className="dt-row">
              <Button variant="primary" onClick={apply} disabled={processor.busy}>
                {processor.busy ? "Converting…" : "Convert to PDF"}
              </Button>
              <Button onClick={clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="csv-to-pdf.zip" />
    </PdfTool>
  );
}
