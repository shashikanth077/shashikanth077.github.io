import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { baseName, findTool, formatBytes, type PickedFile } from "@devtools/tools-core";
import {
  Button,
  Checkbox,
  Field,
  FileDrop,
  Note,
  Panel,
  Select,
  TextInput,
  ToolFrame,
  useFileList,
} from "@devtools/ui";
import { fetchFile } from "@ffmpeg/util";
import { loadFFmpeg, resetFFmpeg } from "./ffmpeg-loader.js";
import "./video-to-audio.css";

/* ------------------------------------------------------------------ */
/* Format catalog                                                       */
/* ------------------------------------------------------------------ */

type OutputFormat = "mp3" | "wav" | "aac" | "m4a" | "flac" | "ogg";

interface FormatSpec {
  label: string;
  ext: string;
  mime: string;
  /** ffmpeg -c:a codec name. */
  codec: string;
  /** True when bitrate/quality has an effect for this codec. */
  bitrateApplies: boolean;
}

const FORMATS: Record<OutputFormat, FormatSpec> = {
  mp3:  { label: "MP3",  ext: "mp3",  mime: "audio/mpeg", codec: "libmp3lame", bitrateApplies: true  },
  wav:  { label: "WAV",  ext: "wav",  mime: "audio/wav",  codec: "pcm_s16le",  bitrateApplies: false },
  aac:  { label: "AAC",  ext: "aac",  mime: "audio/aac",  codec: "aac",        bitrateApplies: true  },
  m4a:  { label: "M4A",  ext: "m4a",  mime: "audio/mp4",  codec: "aac",        bitrateApplies: true  },
  flac: { label: "FLAC", ext: "flac", mime: "audio/flac", codec: "flac",       bitrateApplies: false },
  ogg:  { label: "OGG",  ext: "ogg",  mime: "audio/ogg",  codec: "libvorbis",  bitrateApplies: true  },
};

const BITRATES = [64, 96, 128, 192, 256, 320] as const;
const SAMPLE_RATES = [22050, 44100, 48000] as const;

const ACCEPTED_VIDEO = [
  "video/*",
  ".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv", ".wmv", ".mpeg", ".mpg", ".m4v",
];

/* ------------------------------------------------------------------ */
/* Queue item shape                                                     */
/* ------------------------------------------------------------------ */

type ItemStatus = "pending" | "running" | "done" | "error" | "canceled";

interface QueueItem {
  id: string;
  file: File;
  previewUrl: string;
  duration: number | null;
  /** Editable output filename stem (no extension). */
  outputName: string;
  trimEnabled: boolean;
  trimStart: number;
  trimEnd: number;
  status: ItemStatus;
  progress: number;
  etaSeconds: number | null;
  error: string | null;
  resultBlob: Blob | null;
  resultUrl: string | null;
  resultName: string | null;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function formatDuration(seconds: number | null): string {
  if (seconds == null || !isFinite(seconds)) return "—";
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h > 0) return `${h}:${String(mm).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
  return `${mm}:${String(rem).padStart(2, "0")}`;
}

function parseTime(input: string): number {
  const parts = input.split(":").map((p) => Number(p));
  if (parts.some((p) => !isFinite(p))) return NaN;
  if (parts.length === 1) return parts[0] ?? 0;
  if (parts.length === 2) return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  if (parts.length === 3) return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
  return NaN;
}

/**
 * Reads a video file's duration by mounting it in an off-screen <video> and
 * waiting for metadata. Rejects silently to `null` — a missing duration only
 * means the progress bar can't compute ETA for that file.
 */
function probeDuration(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = url;
    const done = (value: number | null) => {
      video.onloadedmetadata = null;
      video.onerror = null;
      resolve(value);
    };
    video.onloadedmetadata = () => {
      const d = video.duration;
      done(isFinite(d) && d > 0 ? d : null);
    };
    video.onerror = () => done(null);
    // Safety timeout — some containers never resolve.
    setTimeout(() => done(null), 5000);
  });
}

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */

export function VideoToAudio() {
  const route = findTool("video-to-audio");
  const list = useFileList();

  // Per-file metadata beyond the base PickedFile — merged by id.
  const [meta, setMeta] = useState<Record<string, Omit<QueueItem, "id" | "file" | "previewUrl">>>({});

  // Shared settings
  const [format, setFormat] = useState<OutputFormat>("mp3");
  const [bitrate, setBitrate] = useState<(typeof BITRATES)[number]>(192);
  const [sampleRate, setSampleRate] = useState<(typeof SAMPLE_RATES)[number]>(44100);
  const [channels, setChannels] = useState<1 | 2>(2);
  const [keepOriginal, setKeepOriginal] = useState(false);
  const [preserveMetadata, setPreserveMetadata] = useState(true);

  const [isRunning, setIsRunning] = useState(false);
  const [loadProgress, setLoadProgress] = useState<number | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [lastCompleted, setLastCompleted] = useState<string | null>(null);

  const cancelRef = useRef(false);

  /* ---------------- attach previews + probe duration ---------------- */

  useEffect(() => {
    list.files.forEach((file) => {
      if (!file.previewUrl) list.setPreview(file.id, URL.createObjectURL(file.file));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.files.length]);

  useEffect(() => {
    list.files.forEach((file) => {
      if (meta[file.id]) return;
      const stem = baseName(file.name);
      setMeta((current) => ({
        ...current,
        [file.id]: {
          duration: null,
          outputName: stem,
          trimEnabled: false,
          trimStart: 0,
          trimEnd: 0,
          status: "pending",
          progress: 0,
          etaSeconds: null,
          error: null,
          resultBlob: null,
          resultUrl: null,
          resultName: null,
        },
      }));
      // Duration probe uses the preview URL if present, otherwise a fresh one.
      const url = file.previewUrl ?? URL.createObjectURL(file.file);
      void probeDuration(url).then((duration) => {
        if (duration != null) {
          setMeta((current) => {
            const entry = current[file.id];
            if (!entry) return current;
            return { ...current, [file.id]: { ...entry, duration, trimEnd: duration } };
          });
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.files.length]);

  // Revoke result URLs on unmount.
  useEffect(() => {
    return () => {
      Object.values(meta).forEach((m) => {
        if (m.resultUrl) URL.revokeObjectURL(m.resultUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateMeta = useCallback(
    (id: string, patch: Partial<Omit<QueueItem, "id" | "file" | "previewUrl">>) => {
      setMeta((current) => {
        const entry = current[id];
        if (!entry) return current;
        return { ...current, [id]: { ...entry, ...patch } };
      });
    },
    [],
  );

  const removeItem = useCallback(
    (id: string) => {
      const entry = meta[id];
      if (entry?.resultUrl) URL.revokeObjectURL(entry.resultUrl);
      setMeta((current) => {
        const { [id]: _drop, ...rest } = current;
        void _drop;
        return rest;
      });
      list.remove(id);
    },
    [meta, list],
  );

  const resetAll = useCallback(() => {
    Object.values(meta).forEach((m) => m.resultUrl && URL.revokeObjectURL(m.resultUrl));
    setMeta({});
    setGlobalError(null);
    setLastCompleted(null);
    list.clear();
  }, [meta, list]);

  /* ---------------- FFmpeg command builder ---------------- */

  const buildArgs = useCallback(
    (item: QueueItem, inputName: string, outputName: string): string[] => {
      const args: string[] = [];

      // Fast pre-input seek when trim start > 0 (much faster than post-input).
      const useTrim = item.trimEnabled && item.duration != null;
      if (useTrim && item.trimStart > 0) {
        args.push("-ss", String(item.trimStart));
      }

      args.push("-i", inputName);

      if (useTrim) {
        const dur = Math.max(0.1, item.trimEnd - item.trimStart);
        args.push("-t", String(dur));
      }

      // Video track dropped.
      args.push("-vn");

      if (keepOriginal) {
        args.push("-c:a", "copy");
      } else {
        const spec = FORMATS[format];
        args.push("-c:a", spec.codec);
        if (spec.bitrateApplies) args.push("-b:a", `${bitrate}k`);
        args.push("-ar", String(sampleRate));
        args.push("-ac", String(channels));
      }

      args.push("-map_metadata", preserveMetadata ? "0" : "-1");
      args.push("-y", outputName);
      return args;
    },
    [bitrate, channels, format, keepOriginal, preserveMetadata, sampleRate],
  );

  /* ---------------- Convert a single item ---------------- */

  const runOne = useCallback(
    async (item: QueueItem): Promise<void> => {
      updateMeta(item.id, { status: "running", progress: 0, etaSeconds: null, error: null });

      const ffmpeg = await loadFFmpeg({ onProgress: setLoadProgress });
      setLoadProgress(null);

      const ext = keepOriginal
        ? (item.file.name.split(".").pop() || "m4a").toLowerCase()
        : FORMATS[format].ext;
      const outName = `${item.outputName || baseName(item.file.name)}.${ext}`;
      const inputName = `input-${item.id}.${(item.file.name.split(".").pop() || "bin").toLowerCase()}`;

      const startedAt = performance.now();

      const onProgress = ({ progress }: { progress: number; time: number }) => {
        if (cancelRef.current) return;
        const clamped = Math.max(0, Math.min(1, progress));
        const elapsed = (performance.now() - startedAt) / 1000;
        const eta = clamped > 0.02 ? elapsed * (1 / clamped - 1) : null;
        updateMeta(item.id, {
          progress: Math.round(clamped * 100),
          etaSeconds: eta,
        });
      };

      ffmpeg.on("progress", onProgress);

      try {
        await ffmpeg.writeFile(inputName, await fetchFile(item.file));
        const args = buildArgs(item, inputName, outName);
        const code = await ffmpeg.exec(args);
        if (code !== 0) throw new Error(`ffmpeg exited with code ${code}`);

        const data = await ffmpeg.readFile(outName);
        // In-memory cleanup — the WASM FS is not garbage-collected.
        try { await ffmpeg.deleteFile(inputName); } catch { /* ignore */ }
        try { await ffmpeg.deleteFile(outName); } catch { /* ignore */ }

        // Uint8Array or string; converter tools always return binary.
        const payload = typeof data === "string" ? new TextEncoder().encode(data) : data;
        const mime = keepOriginal ? "application/octet-stream" : FORMATS[format].mime;
        // Cast: ffmpeg.wasm returns Uint8Array over ArrayBufferLike which the
        // DOM Blob constructor's stricter typing (ArrayBuffer only) rejects.
        // The runtime data is a plain ArrayBuffer here.
        const blob = new Blob([payload as BlobPart], { type: mime });
        const url = URL.createObjectURL(blob);

        updateMeta(item.id, {
          status: "done",
          progress: 100,
          etaSeconds: 0,
          resultBlob: blob,
          resultUrl: url,
          resultName: outName,
        });
        setLastCompleted(item.id);
      } catch (err) {
        if (cancelRef.current) {
          updateMeta(item.id, { status: "canceled", error: "Canceled" });
        } else {
          updateMeta(item.id, {
            status: "error",
            error: err instanceof Error ? err.message : String(err),
          });
        }
      } finally {
        ffmpeg.off("progress", onProgress);
      }
    },
    [buildArgs, format, keepOriginal, updateMeta],
  );

  /* ---------------- Batch run ---------------- */

  const convertAll = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setGlobalError(null);
    cancelRef.current = false;

    try {
      for (const file of list.files) {
        if (cancelRef.current) break;
        const entry = meta[file.id];
        if (!entry) continue;
        // Skip anything already done — allows re-running after a partial batch.
        if (entry.status === "done") continue;

        const item: QueueItem = { id: file.id, file: file.file, previewUrl: file.previewUrl ?? "", ...entry };
        await runOne(item);
      }
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRunning(false);
      cancelRef.current = false;
    }
  }, [isRunning, list.files, meta, runOne]);

  const cancelAll = useCallback(() => {
    cancelRef.current = true;
    // Terminating the worker aborts any in-flight exec and rejects the promise.
    resetFFmpeg();
  }, []);

  /* ---------------- Derived UI state ---------------- */

  const pendingCount = useMemo(
    () => list.files.filter((f) => (meta[f.id]?.status ?? "pending") === "pending").length,
    [list.files, meta],
  );

  const anyDone = useMemo(
    () => Object.values(meta).some((m) => m.status === "done"),
    [meta],
  );

  const downloadResult = useCallback((entry: typeof meta[string] & { resultBlob: Blob; resultName: string }) => {
    const url = URL.createObjectURL(entry.resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = entry.resultName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }, []);

  const spec = FORMATS[format];

  /* ---------------- Render ---------------- */

  return (
    <ToolFrame title={route?.name ?? "Video to Audio Converter"} tagline={route?.tagline ?? ""}>
      <div className="vta-hero">
        <div className="vta-hero__icon" aria-hidden="true">🎬</div>
        <div className="vta-hero__body">
          <span className="vta-hero__title">100% Private — runs locally with ffmpeg.wasm</span>
          <span className="vta-hero__note">
            Videos never leave your device. The ffmpeg engine (~30 MB) is fetched once from a public CDN on first use.
          </span>
        </div>
      </div>

      <FileDrop
        accept={ACCEPTED_VIDEO}
        onFiles={list.add}
        label="Drop video files here"
        hint="MP4, MOV, AVI, MKV, WEBM, FLV, WMV, MPEG, M4V · batch supported"
        disabled={isRunning}
      />

      {loadProgress !== null && (
        <Panel title="Loading ffmpeg engine…">
          <div className="vta-progress">
            <div className="vta-progress__bar" style={{ width: `${loadProgress}%` }} />
          </div>
        </Panel>
      )}

      {list.files.length > 0 && (
        <Panel title="Audio settings">
          <div className="dt-stack">
            <div className="vta-settings">
              <Field label="Output format">
                {(id) => (
                  <Select
                    id={id}
                    value={format}
                    onChange={(e) => setFormat(e.target.value as OutputFormat)}
                    disabled={keepOriginal || isRunning}
                  >
                    {(Object.keys(FORMATS) as OutputFormat[]).map((key) => (
                      <option key={key} value={key}>{FORMATS[key].label}</option>
                    ))}
                  </Select>
                )}
              </Field>

              {spec.bitrateApplies && (
                <Field label="Bitrate">
                  {(id) => (
                    <Select
                      id={id}
                      value={bitrate}
                      onChange={(e) => setBitrate(Number(e.target.value) as (typeof BITRATES)[number])}
                      disabled={keepOriginal || isRunning}
                    >
                      {BITRATES.map((b) => (
                        <option key={b} value={b}>{b} kbps</option>
                      ))}
                    </Select>
                  )}
                </Field>
              )}

              <Field label="Sample rate">
                {(id) => (
                  <Select
                    id={id}
                    value={sampleRate}
                    onChange={(e) => setSampleRate(Number(e.target.value) as (typeof SAMPLE_RATES)[number])}
                    disabled={keepOriginal || isRunning}
                  >
                    {SAMPLE_RATES.map((r) => (
                      <option key={r} value={r}>{r.toLocaleString()} Hz</option>
                    ))}
                  </Select>
                )}
              </Field>

              <Field label="Channels">
                {(id) => (
                  <Select
                    id={id}
                    value={channels}
                    onChange={(e) => setChannels(Number(e.target.value) as 1 | 2)}
                    disabled={keepOriginal || isRunning}
                  >
                    <option value={2}>Stereo (2)</option>
                    <option value={1}>Mono (1)</option>
                  </Select>
                )}
              </Field>
            </div>

            <div className="dt-row">
              <Checkbox
                label="Keep original quality (copy audio stream, no re-encode)"
                checked={keepOriginal}
                onChange={setKeepOriginal}
              />
              <Checkbox
                label="Preserve metadata tags"
                checked={preserveMetadata}
                onChange={setPreserveMetadata}
              />
            </div>

            {keepOriginal && (
              <Note kind="info">
                Copy mode keeps the source's audio bytes untouched. Output extension will match the source
                container — fails if the container's audio codec isn't compatible.
              </Note>
            )}
          </div>
        </Panel>
      )}

      {list.files.length > 0 && (
        <Panel
          title={`Queue · ${list.files.length} file${list.files.length === 1 ? "" : "s"}`}
          actions={
            <>
              <Button
                variant="primary"
                onClick={() => void convertAll()}
                disabled={isRunning || pendingCount === 0}
              >
                {isRunning
                  ? "Converting…"
                  : pendingCount === 0
                    ? "All done"
                    : `Convert ${pendingCount} file${pendingCount === 1 ? "" : "s"}`}
              </Button>
              {isRunning ? (
                <Button variant="danger" onClick={cancelAll}>Cancel</Button>
              ) : (
                <Button onClick={resetAll} disabled={list.files.length === 0}>Reset</Button>
              )}
            </>
          }
        >
          <div className="vta-queue">
            {list.files.map((file) => (
              <QueueRow
                key={file.id}
                file={file}
                entry={meta[file.id]}
                isRunning={isRunning}
                lastCompleted={lastCompleted}
                onRename={(name) => updateMeta(file.id, { outputName: name })}
                onTrimToggle={(v) => updateMeta(file.id, { trimEnabled: v })}
                onTrimChange={(start, end) => updateMeta(file.id, { trimStart: start, trimEnd: end })}
                onRemove={() => removeItem(file.id)}
                onDownload={() => {
                  const entry = meta[file.id];
                  if (entry?.resultBlob && entry.resultName) {
                    downloadResult({
                      ...entry,
                      resultBlob: entry.resultBlob,
                      resultName: entry.resultName,
                    });
                  }
                }}
              />
            ))}
          </div>
        </Panel>
      )}

      {globalError && <Note kind="error">{globalError}</Note>}

      {anyDone && !isRunning && (
        <Note kind="success">
          Conversion complete. Use the Download button on each finished file, or preview it inline first.
        </Note>
      )}
    </ToolFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Queue row                                                            */
/* ------------------------------------------------------------------ */

interface QueueRowProps {
  file: PickedFile;
  entry: Omit<QueueItem, "id" | "file" | "previewUrl"> | undefined;
  isRunning: boolean;
  lastCompleted: string | null;
  onRename: (name: string) => void;
  onTrimToggle: (enabled: boolean) => void;
  onTrimChange: (start: number, end: number) => void;
  onRemove: () => void;
  onDownload: () => void;
}

function QueueRow({
  file,
  entry,
  isRunning,
  lastCompleted,
  onRename,
  onTrimToggle,
  onTrimChange,
  onRemove,
  onDownload,
}: QueueRowProps) {
  if (!entry) return null;

  const [trimStartInput, setTrimStartInput] = useState(formatDuration(entry.trimStart));
  const [trimEndInput, setTrimEndInput] = useState(formatDuration(entry.trimEnd));

  // Sync display fields when duration finishes probing.
  useEffect(() => {
    if (!entry.trimEnabled) {
      setTrimStartInput(formatDuration(entry.trimStart));
      setTrimEndInput(formatDuration(entry.trimEnd));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.duration]);

  const commitTrim = () => {
    const s = parseTime(trimStartInput);
    const e = parseTime(trimEndInput);
    if (isFinite(s) && isFinite(e) && e > s) {
      onTrimChange(Math.max(0, s), e);
    } else {
      setTrimStartInput(formatDuration(entry.trimStart));
      setTrimEndInput(formatDuration(entry.trimEnd));
    }
  };

  const rowClass =
    "vta-item" +
    (entry.status === "running" ? " vta-item--running" : "") +
    (entry.status === "done" ? " vta-item--done" : "") +
    (entry.status === "error" ? " vta-item--error" : "") +
    (lastCompleted === file.id && entry.status === "done" ? " vta-success" : "");

  return (
    <div className={rowClass}>
      <div className="vta-item__video">
        {file.previewUrl ? (
          <video src={file.previewUrl} muted preload="metadata" controls={entry.status !== "running"} />
        ) : (
          <span>🎬</span>
        )}
      </div>

      <div className="vta-item__body">
        <div className="vta-item__name" title={file.name}>{file.name}</div>
        <div className="vta-item__meta">
          <span>{formatBytes(file.size)}</span>
          <span>duration {formatDuration(entry.duration)}</span>
          <span className={
            "vta-item__status" +
            (entry.status === "running" ? " vta-item__status--running" : "") +
            (entry.status === "done" ? " vta-item__status--done" : "") +
            (entry.status === "error" ? " vta-item__status--error" : "")
          }>
            {entry.status === "pending" && "Pending"}
            {entry.status === "running" && `${entry.progress}%${entry.etaSeconds != null ? ` · ${formatDuration(entry.etaSeconds)} left` : ""}`}
            {entry.status === "done" && "Done"}
            {entry.status === "error" && "Error"}
            {entry.status === "canceled" && "Canceled"}
          </span>
        </div>

        {entry.status === "running" && (
          <div className="vta-progress">
            <div className="vta-progress__bar" style={{ width: `${entry.progress}%` }} />
          </div>
        )}

        <Field label="Output filename">
          {(id) => (
            <TextInput
              id={id}
              value={entry.outputName}
              onChange={(e) => onRename(e.target.value)}
              disabled={isRunning}
              placeholder={baseName(file.name)}
            />
          )}
        </Field>

        <Checkbox
          label="Trim before conversion"
          checked={entry.trimEnabled}
          onChange={onTrimToggle}
        />

        {entry.trimEnabled && (
          <div className="vta-trim">
            <Field label="Start (mm:ss)">
              {(id) => (
                <TextInput
                  id={id}
                  value={trimStartInput}
                  onChange={(e) => setTrimStartInput(e.target.value)}
                  onBlur={commitTrim}
                  disabled={isRunning}
                  placeholder="0:00"
                />
              )}
            </Field>
            <Field label="End (mm:ss)">
              {(id) => (
                <TextInput
                  id={id}
                  value={trimEndInput}
                  onChange={(e) => setTrimEndInput(e.target.value)}
                  onBlur={commitTrim}
                  disabled={isRunning}
                  placeholder={formatDuration(entry.duration)}
                />
              )}
            </Field>
            <Button variant="quiet" onClick={commitTrim} disabled={isRunning}>Apply</Button>
          </div>
        )}

        {entry.status === "done" && entry.resultUrl && (
          <audio className="vta-audio" src={entry.resultUrl} controls preload="none" />
        )}

        {entry.status === "error" && entry.error && (
          <Note kind="error">{entry.error}</Note>
        )}
      </div>

      <div className="vta-item__actions">
        {entry.status === "done" && entry.resultBlob && (
          <Button variant="primary" onClick={onDownload}>Download</Button>
        )}
        <Button
          variant="quiet"
          onClick={onRemove}
          disabled={isRunning && entry.status === "running"}
          aria-label={`Remove ${file.name}`}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
