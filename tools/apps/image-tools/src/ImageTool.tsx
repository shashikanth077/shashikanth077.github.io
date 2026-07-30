import { useEffect, useState } from "react";
import {
  baseName,
  canEncode,
  compressToTarget,
  createZip,
  downloadBlob,
  findTool,
  FORMAT_EXTENSIONS,
  FORMAT_LABELS,
  formatBytes,
  processImage,
  type ImageFormat,
  type ResizeSpec,
  type Rotation,
} from "@devtools/tools-core";
import {
  Button,
  Checkbox,
  Field,
  FileDrop,
  FileList,
  Note,
  Panel,
  Progress,
  ResultGrid,
  Select,
  TextInput,
  ToolFrame,
  useFileList,
  type ResultFile,
} from "@devtools/ui";

export type ImageMode = "image-converter" | "image-resize" | "image-compress";

const FORMATS: ImageFormat[] = ["image/png", "image/jpeg", "image/webp", "image/avif"];

/**
 * All three image tools are the same pipeline — pick files, set options, batch
 * process, download — so they share one component and branch only on the
 * options panel. Splitting them into three near-identical files would triple
 * the surface without adding anything.
 */
export function ImageTool({ mode }: { mode: ImageMode }) {
  const route = findTool(mode);
  const list = useFileList();

  const [format, setFormat] = useState<ImageFormat>(
    mode === "image-compress" ? "image/jpeg" : "image/png",
  );
  const [quality, setQuality] = useState(0.85);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [percent, setPercent] = useState(50);
  const [usePercent, setUsePercent] = useState(false);
  const [rotate, setRotate] = useState<Rotation>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [targetKb, setTargetKb] = useState(200);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ResultFile[]>([]);
  const [unsupported, setUnsupported] = useState<string | null>(null);

  // Thumbnails.
  useEffect(() => {
    list.files.forEach((file) => {
      if (!file.previewUrl) list.setPreview(file.id, URL.createObjectURL(file.file));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.files.length]);

  // toBlob silently falls back to PNG for a format the browser cannot encode,
  // so check rather than shipping a mislabelled file.
  useEffect(() => {
    let cancelled = false;
    void canEncode(format).then((ok) => {
      if (!cancelled) {
        setUnsupported(ok ? null : `${FORMAT_LABELS[format]} encoding isn't supported by this browser.`);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [format]);

  useEffect(
    () => () => results.forEach((r) => r.url && URL.revokeObjectURL(r.url)),
    [results],
  );

  async function run() {
    setBusy(true);
    setError(null);
    setResults((current) => {
      current.forEach((r) => r.url && URL.revokeObjectURL(r.url));
      return [];
    });

    const output: ResultFile[] = [];

    try {
      for (const [index, file] of list.files.entries()) {
        setProgress({ done: index, total: list.files.length });
        const stem = baseName(file.name);

        if (mode === "image-compress") {
          const result = await compressToTarget(file.file, targetKb * 1024, format);
          const saving = Math.round(((file.size - result.blob.size) / file.size) * 100);
          output.push({
            name: `${stem}-compressed.${FORMAT_EXTENSIONS[format]}`,
            blob: result.blob,
            url: result.url,
            note:
              result.blob.size <= targetKb * 1024
                ? `${saving}% smaller · q${result.quality.toFixed(2)}`
                : `couldn't reach target — ${formatBytes(result.blob.size)}`,
          });
          continue;
        }

        let spec: ResizeSpec | undefined;
        if (mode === "image-resize") {
          if (usePercent) {
            // Percentage is relative to the source, so the image must be
            // decoded before the target width is known.
            const bitmap = await createImageBitmap(file.file);
            spec = { width: Math.round((bitmap.width * percent) / 100) };
            bitmap.close();
          } else {
            spec = {
              width: width ? Number(width) : undefined,
              height: height ? Number(height) : undefined,
            };
          }
        }

        const result = await processImage(file.file, {
          format,
          quality,
          resize: spec,
          rotate,
          flipH,
          flipV,
        });

        output.push({
          name: `${stem}.${FORMAT_EXTENSIONS[format]}`,
          blob: result.blob,
          url: result.url,
          note: `${result.width}×${result.height}`,
        });
      }

      setProgress({ done: list.files.length, total: list.files.length });
      setResults(output);
      if (output.length === 0) setError("Add at least one image.");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function downloadAll() {
    const zip = await createZip(results.map((r) => ({ name: r.name, data: r.blob })));
    downloadBlob(zip, `${mode}.zip`);
  }

  const lossy = format !== "image/png";

  return (
    <ToolFrame title={route?.name ?? mode} tagline={route?.tagline ?? ""}>
      <FileDrop
        accept={["image/*"]}
        onFiles={list.add}
        label="Drop images here"
        hint="JPG, PNG, WebP, AVIF, GIF, BMP · batch supported"
        disabled={busy}
      />

      {list.files.length > 0 && (
        <Panel title={`${list.files.length} image${list.files.length === 1 ? "" : "s"}`}>
          <div className="dt-stack">
            <FileList files={list.files} onRemove={list.remove} />

            <div className="dt-row">
              <Field label="Output format">
                {(id) => (
                  <Select
                    id={id}
                    value={format}
                    onChange={(e) => setFormat(e.target.value as ImageFormat)}
                  >
                    {FORMATS.filter((f) => mode !== "image-compress" || f !== "image/png").map((f) => (
                      <option key={f} value={f}>
                        {FORMAT_LABELS[f]}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>

              {mode === "image-compress" ? (
                <Field label="Target size" hint="Quality is found by binary search">
                  {(id) => (
                    <TextInput
                      id={id}
                      type="number"
                      min={10}
                      max={10000}
                      value={targetKb}
                      onChange={(e) => setTargetKb(Number(e.target.value))}
                    />
                  )}
                </Field>
              ) : (
                lossy && (
                  <Field label="Quality" hint={`${Math.round(quality * 100)}%`}>
                    {(id) => (
                      <input
                        id={id}
                        type="range"
                        min={10}
                        max={100}
                        value={Math.round(quality * 100)}
                        onChange={(e) => setQuality(Number(e.target.value) / 100)}
                        style={{ width: "100%", accentColor: "var(--accent)" }}
                      />
                    )}
                  </Field>
                )
              )}
            </div>

            {mode === "image-resize" && (
              <>
                <Checkbox label="Resize by percentage" checked={usePercent} onChange={setUsePercent} />
                {usePercent ? (
                  <Field label="Scale" hint={`${percent}% of the original width`}>
                    {(id) => (
                      <input
                        id={id}
                        type="range"
                        min={5}
                        max={100}
                        value={percent}
                        onChange={(e) => setPercent(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "var(--accent)" }}
                      />
                    )}
                  </Field>
                ) : (
                  <div className="dt-row">
                    <Field label="Width (px)" hint="Leave blank to derive from height">
                      {(id) => (
                        <TextInput id={id} type="number" value={width} onChange={(e) => setWidth(e.target.value)} />
                      )}
                    </Field>
                    <Field label="Height (px)" hint="Aspect ratio is preserved">
                      {(id) => (
                        <TextInput id={id} type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
                      )}
                    </Field>
                  </div>
                )}
                <Note kind="info">
                  Images are never scaled above their original size — upscaling adds bytes, not detail.
                </Note>
              </>
            )}

            {mode === "image-converter" && (
              <div className="dt-row">
                <Field label="Rotate">
                  {(id) => (
                    <Select
                      id={id}
                      value={String(rotate)}
                      onChange={(e) => setRotate(Number(e.target.value) as Rotation)}
                    >
                      <option value="0">None</option>
                      <option value="90">90° clockwise</option>
                      <option value="180">180°</option>
                      <option value="270">90° anticlockwise</option>
                    </Select>
                  )}
                </Field>
                <Checkbox label="Flip horizontally" checked={flipH} onChange={setFlipH} />
                <Checkbox label="Flip vertically" checked={flipV} onChange={setFlipV} />
              </div>
            )}

            {unsupported && <Note kind="warning">{unsupported}</Note>}
            {format === "image/jpeg" && (
              <Note kind="info">
                JPEG has no transparency — transparent areas are flattened onto white.
              </Note>
            )}

            {progress && <Progress value={progress.done} total={progress.total} />}

            <div className="dt-row">
              <Button variant="primary" onClick={run} disabled={busy || Boolean(unsupported)}>
                {busy ? "Processing…" : `Process ${list.files.length} image${list.files.length === 1 ? "" : "s"}`}
              </Button>
              <Button onClick={list.clear} disabled={busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {error && <Note kind="error">{error}</Note>}

      <ResultGrid
        results={results}
        onDownload={(r) => downloadBlob(r.blob, r.name)}
        onDownloadAll={() => void downloadAll()}
      />
    </ToolFrame>
  );
}

export function ImageConverter() {
  return <ImageTool mode="image-converter" />;
}
export function ImageResizer() {
  return <ImageTool mode="image-resize" />;
}
export function ImageCompressor() {
  return <ImageTool mode="image-compress" />;
}
