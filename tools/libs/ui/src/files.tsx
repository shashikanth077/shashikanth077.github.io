import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  baseName,
  formatBytes,
  matchesAccept,
  toPickedFile,
  type PickedFile,
} from "@devtools/tools-core";

/* ------------------------------------------------------------------ */
/* Drop zone                                                            */
/* ------------------------------------------------------------------ */

export interface FileDropProps {
  onFiles: (files: PickedFile[]) => void;
  /** Extensions (".pdf") or MIME types ("image/*"). Empty means anything. */
  accept?: string[];
  multiple?: boolean;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

/**
 * Drag-and-drop file input.
 *
 * dragenter/dragleave fire for every child element the pointer crosses, so a
 * naive boolean flickers constantly. Counting enters and leaves is the standard
 * fix — the zone is only "not dragging" when the count returns to zero.
 */
export function FileDrop({
  onFiles,
  accept = [],
  multiple = true,
  label,
  hint,
  disabled,
}: FileDropProps) {
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);
  const depth = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const accepted = accept.length ? accept.join(", ") : "any file";

  const handle = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return;
      const incoming = Array.from(list);
      const ok = incoming.filter((f) => matchesAccept(f, accept));
      const bad = incoming.filter((f) => !matchesAccept(f, accept));

      setRejected(bad.map((f) => f.name));
      if (ok.length) onFiles((multiple ? ok : ok.slice(0, 1)).map(toPickedFile));
    },
    [accept, multiple, onFiles],
  );

  return (
    <div className="dt-drop-wrap">
      <div
        className={`dt-drop${dragging ? " dt-drop--active" : ""}${disabled ? " dt-drop--disabled" : ""}`}
        onDragEnter={(e) => {
          e.preventDefault();
          if (disabled) return;
          depth.current += 1;
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          depth.current -= 1;
          if (depth.current <= 0) {
            depth.current = 0;
            setDragging(false);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          depth.current = 0;
          setDragging(false);
          if (!disabled) handle(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="dt-drop__input"
          multiple={multiple}
          accept={accept.join(",")}
          disabled={disabled}
          onChange={(e) => {
            handle(e.target.files);
            // Reset so re-picking the same file still fires change.
            e.target.value = "";
          }}
        />
        <svg className="dt-drop__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 16V4m0 0L8 8m4-4 4 4M4 17v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <label className="dt-drop__label" htmlFor={inputId}>
          {label ?? (multiple ? "Drop files here" : "Drop a file here")}
          <span className="dt-drop__browse"> or browse</span>
        </label>
        <span className="dt-drop__hint">{hint ?? `Accepts ${accepted}`}</span>
      </div>

      {rejected.length > 0 && (
        <p className="dt-drop__rejected" role="alert">
          Skipped {rejected.length} file{rejected.length === 1 ? "" : "s"} of the wrong type:{" "}
          {rejected.slice(0, 3).join(", ")}
          {rejected.length > 3 ? "…" : ""}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* File list                                                            */
/* ------------------------------------------------------------------ */

export interface FileListProps {
  files: PickedFile[];
  onRemove?: (id: string) => void;
  onMove?: (id: string, direction: -1 | 1) => void;
  /** Extra line under the name, e.g. "12 pages". */
  meta?: (file: PickedFile) => ReactNode;
  reorderable?: boolean;
}

export function FileList({ files, onRemove, onMove, meta, reorderable }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <ul className="dt-filelist">
      {files.map((file, index) => (
        <li className="dt-filecard" key={file.id}>
          <div className="dt-filecard__thumb">
            {file.previewUrl ? (
              <img src={file.previewUrl} alt="" />
            ) : (
              <span className="dt-filecard__ext">
                {(file.name.split(".").pop() ?? "?").slice(0, 4).toUpperCase()}
              </span>
            )}
          </div>

          <div className="dt-filecard__body">
            <span className="dt-filecard__name" title={file.name}>
              {file.name}
            </span>
            <span className="dt-filecard__meta">
              {formatBytes(file.size)}
              {meta ? <> · {meta(file)}</> : null}
            </span>
          </div>

          <div className="dt-filecard__actions">
            {reorderable && onMove && (
              <>
                <button
                  type="button"
                  className="dt-iconbtn"
                  onClick={() => onMove(file.id, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${file.name} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="dt-iconbtn"
                  onClick={() => onMove(file.id, 1)}
                  disabled={index === files.length - 1}
                  aria-label={`Move ${file.name} down`}
                >
                  ↓
                </button>
              </>
            )}
            {onRemove && (
              <button
                type="button"
                className="dt-iconbtn dt-iconbtn--danger"
                onClick={() => onRemove(file.id)}
                aria-label={`Remove ${file.name}`}
              >
                ✕
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Progress + results                                                   */
/* ------------------------------------------------------------------ */

export function Progress({ value, total, label }: { value: number; total: number; label?: string }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="dt-progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <div className="dt-progress__bar" style={{ width: `${percent}%` }} />
      <span className="dt-progress__label">{label ?? `${value} of ${total}`}</span>
    </div>
  );
}

export interface ResultFile {
  name: string;
  blob: Blob;
  /** Preview thumbnail, for image results. */
  url?: string;
  note?: string;
}

export function ResultGrid({
  results,
  onDownload,
  onDownloadAll,
}: {
  results: ResultFile[];
  onDownload: (result: ResultFile) => void;
  onDownloadAll?: () => void;
}) {
  if (results.length === 0) return null;

  return (
    <div className="dt-results">
      <div className="dt-results__head">
        <span className="dt-results__count">
          {results.length} file{results.length === 1 ? "" : "s"} ready
        </span>
        {onDownloadAll && results.length > 1 && (
          <button type="button" className="dt-btn dt-btn--primary" onClick={onDownloadAll}>
            Download all as ZIP
          </button>
        )}
      </div>

      <ul className="dt-results__grid">
        {results.map((result) => (
          <li key={result.name} className="dt-resultcard">
            {result.url ? (
              <img className="dt-resultcard__preview" src={result.url} alt="" loading="lazy" />
            ) : (
              <div className="dt-resultcard__preview dt-resultcard__preview--file">
                {(result.name.split(".").pop() ?? "?").toUpperCase()}
              </div>
            )}
            <span className="dt-resultcard__name" title={result.name}>
              {result.name}
            </span>
            <span className="dt-resultcard__meta">
              {formatBytes(result.blob.size)}
              {result.note ? ` · ${result.note}` : ""}
            </span>
            <button type="button" className="dt-btn dt-btn--ghost" onClick={() => onDownload(result)}>
              Download
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/**
 * Owns a list of picked files and the object URLs attached to them.
 *
 * Every preview URL is revoked on removal and on unmount — without that, a
 * session of converting a few hundred images leaks the whole set.
 */
export function useFileList(initial: PickedFile[] = []) {
  const [files, setFiles] = useState<PickedFile[]>(initial);
  const filesRef = useRef(files);
  filesRef.current = files;

  useEffect(
    () => () => {
      filesRef.current.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    },
    [],
  );

  const add = useCallback((incoming: PickedFile[]) => {
    setFiles((current) => [...current, ...incoming]);
  }, []);

  const replace = useCallback((incoming: PickedFile[]) => {
    setFiles((current) => {
      current.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
      return incoming;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setFiles((current) => {
      const target = current.find((f) => f.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return current.filter((f) => f.id !== id);
    });
  }, []);

  const move = useCallback((id: string, direction: -1 | 1) => {
    setFiles((current) => {
      const index = current.findIndex((f) => f.id === id);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= current.length) return current;
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      if (item) copy.splice(next, 0, item);
      return copy;
    });
  }, []);

  const clear = useCallback(() => {
    setFiles((current) => {
      current.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
      return [];
    });
  }, []);

  const setPreview = useCallback((id: string, previewUrl: string) => {
    setFiles((current) => current.map((f) => (f.id === id ? { ...f, previewUrl } : f)));
  }, []);

  return { files, add, replace, remove, move, clear, setPreview, setFiles };
}

export { baseName, formatBytes };
export type { PickedFile };
