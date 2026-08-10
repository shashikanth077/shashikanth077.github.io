import { useState } from "react";
import { stampPages, zeroPad, type StampFontFamily, type StampPosition } from "@devtools/tools-core";
import { Button, FileDrop, Field, Panel, TextInput, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";
import { ColorField, FontFamilyField, FontSizeField, PageRangeField, PositionField, POSITION_OPTIONS } from "./stamp-controls.js";

const HEADER_FOOTER_POSITIONS = POSITION_OPTIONS.filter((o) => o.value !== "center");

export default function BatesNumberingPdf() {
  const { files, add, clear } = useFileList();
  const getBytes = useFileBytes();
  const processor = useProcessor();

  const [prefix, setPrefix] = useState("ABC");
  const [suffix, setSuffix] = useState("");
  const [digits, setDigits] = useState(6);
  const [startFrom, setStartFrom] = useState(1);
  const [position, setPosition] = useState<StampPosition>("bottom-right");
  const [fontFamily, setFontFamily] = useState<StampFontFamily>("Helvetica");
  const [fontSize, setFontSize] = useState(10);
  const [color, setColor] = useState("#000000");
  const [pages, setPages] = useState("");

  const file = files[0];
  const bates = (n: number) => `${prefix}${zeroPad(n, digits)}${suffix}`;
  const preview = [0, 1, 2].map((i) => bates(startFrom + i)).join(", ");

  async function apply() {
    if (!file) return;
    await processor.run(async () => {
      const bytes = await getBytes(file);
      const data = await stampPages(bytes, (n) => bates(startFrom + n - 1), { position, fontFamily, fontSize, color, pages });
      const name = file.file.name.replace(/\.pdf$/i, "-bates.pdf");
      return [{ name, blob: new Blob([data as BlobPart], { type: "application/pdf" }) }];
    });
  }

  return (
    <PdfTool slug="bates-numbering-pdf">
      <FileDrop accept={[".pdf"]} multiple={false} onFiles={add} label="Drop a PDF here to Bates-stamp it" disabled={processor.busy} />

      {file && (
        <Panel title={file.file.name}>
          <div className="dt-stack">
            <div className="dt-row">
              <Field label="Prefix" hint='e.g. "ABC-" or "Exhibit "'>
                {(id) => <TextInput id={id} value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="ABC" />}
              </Field>
              <Field label="Digits" hint="zero-padded width">
                {(id) => <TextInput id={id} type="number" min={1} max={12} value={digits} onChange={(e) => setDigits(Number(e.target.value))} />}
              </Field>
              <Field label="Suffix" hint="optional">
                {(id) => <TextInput id={id} value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="" />}
              </Field>
              <Field label="Start from">
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
                {processor.busy ? "Bates stamping…" : "Bates Stamp PDF"}
              </Button>
              <Button onClick={clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="bates-numbered-pdf.zip" />
    </PdfTool>
  );
}
