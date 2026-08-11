import { removeAnnotations } from "@devtools/tools-core";
import { Button, FileDrop, Note, Panel, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";

export default function RemoveAnnotationsPdf() {
  const { files, replace, clear } = useFileList();
  const getBytes = useFileBytes();
  const processor = useProcessor();

  const file = files[0];

  async function apply() {
    if (!file) return;
    await processor.run(async () => {
      const bytes = await getBytes(file);
      const { data, removed } = await removeAnnotations(bytes);
      if (removed === 0) throw new Error("No comments, highlights or other markup annotations found — nothing to remove.");
      const name = file.file.name.replace(/\.pdf$/i, "-no-annotations.pdf");
      return [{ name, blob: new Blob([data as BlobPart], { type: "application/pdf" }), note: `${removed} annotation${removed === 1 ? "" : "s"} removed` }];
    });
  }

  return (
    <PdfTool slug="remove-pdf-annotations">
      <FileDrop accept={[".pdf"]} multiple={false} onFiles={replace} label="Drop a PDF here to strip its annotations" disabled={processor.busy} />

      {file && (
        <Panel title={file.file.name}>
          <div className="dt-stack">
            <Note kind="info">Removes comments, highlights, sticky notes, stamps and ink marks. Fillable form fields and hyperlinks are left untouched.</Note>
            <div className="dt-row">
              <Button variant="primary" onClick={apply} disabled={processor.busy}>
                {processor.busy ? "Removing…" : "Remove Annotations"}
              </Button>
              <Button onClick={clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="no-annotations-pdf.zip" />
    </PdfTool>
  );
}
