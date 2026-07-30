import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createZip, downloadBlob, findTool, type PickedFile } from "@devtools/tools-core";
import { Note, ResultGrid, ToolFrame, type ResultFile } from "@devtools/ui";

/**
 * Shared plumbing for every PDF tool: run an async job, surface progress and
 * errors, collect downloadable results.
 *
 * Every tool here follows the same shape — pick files, press a button, get
 * files back — so this keeps that flow in one place rather than repeating the
 * busy/error/progress dance eleven times.
 */
export function useProcessor() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [results, setResults] = useState<ResultFile[]>([]);
  const resultsRef = useRef(results);
  resultsRef.current = results;

  // Result previews are object URLs; without this a long session leaks them all.
  useEffect(
    () => () => {
      resultsRef.current.forEach((r) => r.url && URL.revokeObjectURL(r.url));
    },
    [],
  );

  const reset = useCallback(() => {
    setResults((current) => {
      current.forEach((r) => r.url && URL.revokeObjectURL(r.url));
      return [];
    });
    setError(null);
    setProgress(null);
  }, []);

  const run = useCallback(
    async (job: (report: (done: number, total: number) => void) => Promise<ResultFile[]>) => {
      reset();
      setBusy(true);
      try {
        const output = await job((done, total) => setProgress({ done, total }));
        setResults(output);
        if (output.length === 0) setError("The operation produced no output.");
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setBusy(false);
        setProgress(null);
      }
    },
    [reset],
  );

  return { busy, error, progress, results, run, reset, setError };
}

export function downloadResult(result: ResultFile): void {
  downloadBlob(result.blob, result.name);
}

export async function downloadAllAsZip(results: ResultFile[], zipName: string): Promise<void> {
  const zip = await createZip(results.map((r) => ({ name: r.name, data: r.blob })));
  downloadBlob(zip, zipName);
}

/**
 * Standard tool wrapper — pulls title, tagline and caveat straight from the
 * route manifest so the page, the nav and the prerendered metadata cannot drift.
 */
export function PdfTool({ slug, children }: { slug: string; children: ReactNode }) {
  const route = findTool(slug);

  return (
    <ToolFrame title={route?.name ?? slug} tagline={route?.tagline ?? ""}>
      {route?.caveat && (
        <p className="dt-caveat">
          <strong>Worth knowing:</strong> {route.caveat}
        </p>
      )}
      {children}
    </ToolFrame>
  );
}

export function ProcessorOutput({
  error,
  results,
  zipName,
}: {
  error: string | null;
  results: ResultFile[];
  zipName: string;
}) {
  return (
    <>
      {error ? <Note kind="error">{error}</Note> : null}
      <ResultGrid
        results={results}
        onDownload={downloadResult}
        onDownloadAll={() => void downloadAllAsZip(results, zipName)}
      />
    </>
  );
}

/** Reads a picked file once and caches the bytes for repeated operations. */
export function useFileBytes() {
  const cache = useRef(new Map<string, ArrayBuffer>());

  return useCallback(async (file: PickedFile): Promise<ArrayBuffer> => {
    const hit = cache.current.get(file.id);
    if (hit) return hit;
    const bytes = await file.file.arrayBuffer();
    cache.current.set(file.id, bytes);
    return bytes;
  }, []);
}
