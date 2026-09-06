import { useState } from "react";
import { textToPdf } from "@devtools/tools-core";
import { Button, Checkbox, FileDrop, Note, Panel, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";

export default function TxtToPdf() {
  const { files, replace, clear } = useFileList();
  const getBytes = useFileBytes();
  const processor = useProcessor();
  const [monospace, setMonospace] = useState(true);

  const file = files[0];

  async function apply() {
    if (!file) return;
    await processor.run(async () => {
      const bytes = await getBytes(file);
      const text = new TextDecoder().decode(bytes);
      const data = await textToPdf(text, { monospace });
      const name = file.file.name.replace(/\.txt$/i, "") + ".pdf";
      return [{ name, blob: new Blob([data as BlobPart], { type: "application/pdf" }) }];
    });
  }

  return (
    <PdfTool slug="txt-to-pdf">
      <FileDrop accept={[".txt", "text/plain"]} multiple={false} onFiles={replace} label="Drop a .txt file here" disabled={processor.busy} />

      {file && (
        <Panel title={file.file.name}>
          <div className="dt-stack">
            <Checkbox
              label="Keep monospace layout (preserves alignment in tables, code and ASCII art)"
              checked={monospace}
              onChange={setMonospace}
            />
            <Note kind="info">
              Line breaks are kept exactly as they are in the file; only a line too wide for the page gets wrapped.
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

      <ProcessorOutput error={processor.error} results={processor.results} zipName="text-to-pdf.zip" />
    </PdfTool>
  );
}
