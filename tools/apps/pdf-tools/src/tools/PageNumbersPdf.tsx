import { useState } from "react";
import { formatPageNumberText, stampPages, type PageNumberFormat, type StampFontFamily, type StampPosition } from "@devtools/tools-core";
import { Button, FileDrop, Field, Panel, Select, TextInput, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";
import { ColorField, FontFamilyField, FontSizeField, PageRangeField, PositionField, POSITION_OPTIONS } from "./stamp-controls.js";

const HEADER_FOOTER_POSITIONS = POSITION_OPTIONS.filter((o) => o.value !== "center");

export default function PageNumbersPdf() {
  const { files, add, clear } = useFileList();
  const getBytes = useFileBytes();
  const processor = useProcessor();

  const [prefix, setPrefix] = useState("Page");
  const [format, setFormat] = useState<PageNumberFormat>("arabic");
  const [position, setPosition] = useState<StampPosition>("bottom-center");
  const [fontFamily, setFontFamily] = useState<StampFontFamily>("Helvetica");
  const [fontSize, setFontSize] = useState(10);
  const [color, setColor] = useState("#000000");
  const [startFrom, setStartFrom] = useState(1);
  const [pages, setPages] = useState("");

  const file = files[0];
  const preview = [1, 2, 3].map((n) => formatPageNumberText(prefix, startFrom + n - 1, startFrom + 2, format)).join(", ");

  async function apply() {
    if (!file) return;
    await processor.run(async () => {
      const bytes = await getBytes(file);
      const data = await stampPages(
        bytes,
        (n, total) => formatPageNumberText(prefix, startFrom + n - 1, total, format),
        { position, fontFamily, fontSize, color, pages },
      );
      const name = file.file.name.replace(/\.pdf$/i, "-numbered.pdf");
      return [{ name, blob: new Blob([data as BlobPart], { type: "application/pdf" }) }];
    });
  }

  return (
    <PdfTool slug="page-numbers-pdf">
      <FileDrop accept={[".pdf"]} multiple={false} onFiles={add} label="Drop a PDF here to add page numbers" disabled={processor.busy} />

      {file && (
        <Panel title={file.file.name}>
          <div className="dt-stack">
            <div className="dt-row">
              <Field label="Prefix" hint='e.g. "Page", or leave blank'>
                {(id) => <TextInput id={id} value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="Page" />}
              </Field>
              <Field label="Number style">
                {(id) => (
                  <Select id={id} value={format} onChange={(e) => setFormat(e.target.value as PageNumberFormat)}>
                    <option value="arabic">1, 2, 3</option>
                    <option value="roman">I, II, III</option>
                    <option value="arabic-of-total">1 of N</option>
                  </Select>
                )}
              </Field>
              <Field label="Start numbering from">
                {(id) => <TextInput id={id} type="number" min={0} value={startFrom} onChange={(e) => setStartFrom(Number(e.target.value))} />}
              </Field>
            </div>

            <p style={{ fontSize: "0.8125rem", color: "var(--text-soft)" }}>Preview: {preview}</p>

            <div className="dt-row">
              <PositionField value={position} onChange={setPosition} options={HEADER_FOOTER_POSITIONS} />
              <FontFamilyField value={fontFamily} onChange={setFontFamily} />
              <FontSizeField value={fontSize} onChange={setFontSize} />
              <ColorField value={color} onChange={setColor} />
            </div>

            <PageRangeField value={pages} onChange={setPages} />

            <div className="dt-row">
              <Button variant="primary" onClick={apply} disabled={processor.busy}>
                {processor.busy ? "Adding page numbers…" : "Add Page Numbers"}
              </Button>
              <Button onClick={clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="numbered-pdf.zip" />
    </PdfTool>
  );
}
