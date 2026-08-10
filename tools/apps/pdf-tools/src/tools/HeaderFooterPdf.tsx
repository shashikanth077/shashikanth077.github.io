import { useState } from "react";
import { stampPages, type StampFontFamily, type StampPosition } from "@devtools/tools-core";
import { Button, FileDrop, Field, Panel, TextInput, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";
import { ColorField, FontFamilyField, FontSizeField, PageRangeField } from "./stamp-controls.js";

/** Replaces {page} and {pages} tokens with the current page's 1-based sequence and the document's total page count. */
function resolveTokens(template: string, page: number, totalPages: number): string {
  return template.replace(/\{page\}/gi, String(page)).replace(/\{pages\}/gi, String(totalPages));
}

const ZONES: Array<{ key: string; position: StampPosition; label: string }> = [
  { key: "headerLeft", position: "top-left", label: "Header — left" },
  { key: "headerCenter", position: "top-center", label: "Header — center" },
  { key: "headerRight", position: "top-right", label: "Header — right" },
  { key: "footerLeft", position: "bottom-left", label: "Footer — left" },
  { key: "footerCenter", position: "bottom-center", label: "Footer — center" },
  { key: "footerRight", position: "bottom-right", label: "Footer — right" },
];

export default function HeaderFooterPdf() {
  const { files, add, clear } = useFileList();
  const getBytes = useFileBytes();
  const processor = useProcessor();

  const [zoneText, setZoneText] = useState<Record<string, string>>({});
  const [fontFamily, setFontFamily] = useState<StampFontFamily>("Helvetica");
  const [fontSize, setFontSize] = useState(10);
  const [color, setColor] = useState("#000000");
  const [pages, setPages] = useState("");

  const file = files[0];
  const anyText = ZONES.some((z) => zoneText[z.key]?.trim());

  async function apply() {
    if (!file || !anyText) return;
    await processor.run(async () => {
      let bytes: ArrayBuffer | Uint8Array = await getBytes(file);
      for (const zone of ZONES) {
        const template = zoneText[zone.key]?.trim();
        if (!template) continue;
        bytes = await stampPages(bytes as ArrayBuffer, (n, total) => resolveTokens(template, n, total), {
          position: zone.position,
          fontFamily,
          fontSize,
          color,
          pages,
        });
      }
      const name = file.file.name.replace(/\.pdf$/i, "-header-footer.pdf");
      return [{ name, blob: new Blob([bytes as BlobPart], { type: "application/pdf" }) }];
    });
  }

  return (
    <PdfTool slug="header-footer-pdf">
      <FileDrop accept={[".pdf"]} multiple={false} onFiles={add} label="Drop a PDF here to add a header or footer" disabled={processor.busy} />

      {file && (
        <Panel title={file.file.name}>
          <div className="dt-stack">
            <p style={{ fontSize: "0.8125rem", color: "var(--text-soft)" }}>
              Fill in any of the six zones below. Use <code>{"{page}"}</code> for the current page number and{" "}
              <code>{"{pages}"}</code> for the total page count.
            </p>

            <div className="dt-row">
              {ZONES.slice(0, 3).map((zone) => (
                <Field key={zone.key} label={zone.label}>
                  {(id) => (
                    <TextInput
                      id={id}
                      value={zoneText[zone.key] ?? ""}
                      onChange={(e) => setZoneText((cur) => ({ ...cur, [zone.key]: e.target.value }))}
                      placeholder="Optional"
                    />
                  )}
                </Field>
              ))}
            </div>
            <div className="dt-row">
              {ZONES.slice(3, 6).map((zone) => (
                <Field key={zone.key} label={zone.label}>
                  {(id) => (
                    <TextInput
                      id={id}
                      value={zoneText[zone.key] ?? ""}
                      onChange={(e) => setZoneText((cur) => ({ ...cur, [zone.key]: e.target.value }))}
                      placeholder="Optional"
                    />
                  )}
                </Field>
              ))}
            </div>

            <div className="dt-row">
              <FontFamilyField value={fontFamily} onChange={setFontFamily} />
              <FontSizeField value={fontSize} onChange={setFontSize} />
              <ColorField value={color} onChange={setColor} />
            </div>

            <PageRangeField value={pages} onChange={setPages} />

            <div className="dt-row">
              <Button variant="primary" onClick={apply} disabled={processor.busy || !anyText}>
                {processor.busy ? "Applying…" : "Add Header & Footer"}
              </Button>
              <Button onClick={clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="header-footer-pdf.zip" />
    </PdfTool>
  );
}
