import { useState } from "react";
import { baseName, compressByRasterising, formatBytes } from "@devtools/tools-core";
import { Button, Field, FileDrop, Note, Panel, Progress, Select, StatRow, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";

const PRESETS = [
  { id: "high", label: "Lighter — keeps more detail", scale: 2, quality: 0.75 },
  { id: "balanced", label: "Balanced", scale: 1.5, quality: 0.6 },
  { id: "small", label: "Smallest — visibly softer", scale: 1.2, quality: 0.45 },
] as const;

export default function CompressPdf() {
  const list = useFileList();
  const readBytes = useFileBytes();
  const processor = useProcessor();

  const [preset, setPreset] = useState<(typeof PRESETS)[number]["id"]>("balanced");
  const [stats, setStats] = useState<{ before: number; after: number; percent: number } | null>(null);

  const file = list.files[0];
  const chosen = PRESETS.find((p) => p.id === preset) ?? PRESETS[1];

  async function compress() {
    if (!file) return;
    const stem = baseName(file.name);
    setStats(null);

    await processor.run(async (report) => {
      const result = await compressByRasterising(
        await readBytes(file),
        { scale: chosen.scale, quality: chosen.quality },
        report,
      );

      setStats({ before: result.beforeBytes, after: result.afterBytes, percent: result.percent });

      return [
        {
          name: `${stem}-compressed.pdf`,
          blob: new Blob([result.data as BlobPart], { type: "application/pdf" }),
          note: result.percent > 0 ? `${result.percent}% smaller` : `${Math.abs(result.percent)}% larger`,
        },
      ];
    });
  }

  return (
    <PdfTool slug="compress-pdf">
      <FileDrop
        accept={[".pdf", "application/pdf"]}
        onFiles={(files) => {
          setStats(null);
          list.replace(files);
        }}
        multiple={false}
        label="Drop a PDF here"
        hint="Works well on scans and image-heavy documents"
        disabled={processor.busy}
      />

      {file && (
        <Panel title={`${file.name} · ${formatBytes(file.size)}`}>
          <div className="dt-stack">
            <Field label="Strength" hint={`Renders pages at ${chosen.scale}× and encodes at quality ${chosen.quality}`}>
              {(id) => (
                <Select id={id} value={preset} onChange={(e) => setPreset(e.target.value as typeof preset)}>
                  {PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            {processor.progress && (
              <Progress
                value={processor.progress.done}
                total={processor.progress.total}
                label={`Rendering page ${processor.progress.done} of ${processor.progress.total}`}
              />
            )}

            <div className="dt-row">
              <Button variant="primary" onClick={compress} disabled={processor.busy}>
                {processor.busy ? "Compressing…" : "Compress PDF"}
              </Button>
              <Button onClick={list.clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {stats && (
        <>
          <StatRow
            items={[
              { label: "Before", value: formatBytes(stats.before) },
              { label: "After", value: formatBytes(stats.after) },
              { label: stats.percent >= 0 ? "Saved" : "Grew", value: `${Math.abs(stats.percent)}%` },
            ]}
          />
          {stats.percent <= 0 && (
            <Note kind="warning">
              This file got <strong>bigger</strong>. That is the expected result on a text PDF: the
              original stored compact glyph instructions, and it now stores a photograph of each
              page. Keep the original.
            </Note>
          )}
        </>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="compressed.zip" />
    </PdfTool>
  );
}
