import { flattenForm } from "@devtools/tools-core";
import { Button, FileDrop, Note, Panel, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";

export default function FlattenPdf() {
  const { files, replace, clear } = useFileList();
  const getBytes = useFileBytes();
  const processor = useProcessor();

  const file = files[0];

  async function apply() {
    if (!file) return;
    await processor.run(async () => {
      const bytes = await getBytes(file);
      const { data, fieldCount } = await flattenForm(bytes);
      if (fieldCount === 0) throw new Error("No fillable form fields found — nothing to flatten.");
      const name = file.file.name.replace(/\.pdf$/i, "-flattened.pdf");
      return [
        {
          name,
          blob: new Blob([data as BlobPart], { type: "application/pdf" }),
          note: `${fieldCount} field${fieldCount === 1 ? "" : "s"} flattened`,
        },
      ];
    });
  }

  return (
    <PdfTool slug="flatten-pdf">
      <FileDrop accept={[".pdf"]} multiple={false} onFiles={replace} label="Drop a PDF here to flatten its form fields" disabled={processor.busy} />

      {file && (
        <Panel title={file.file.name}>
          <div className="dt-stack">
            <Note kind="info">
              Bakes every filled-in text box, checkbox and selection into the page itself — the result looks identical, but the form fields
              are gone, so nothing about it can be edited, filled in again, or read back out programmatically.
            </Note>
            <div className="dt-row">
              <Button variant="primary" onClick={apply} disabled={processor.busy}>
                {processor.busy ? "Flattening…" : "Flatten Form"}
              </Button>
              <Button onClick={clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="flattened-pdf.zip" />
    </PdfTool>
  );
}
