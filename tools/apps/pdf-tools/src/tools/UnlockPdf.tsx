import { useState, useRef } from "react";
import {
  PdfPasswordRequiredError,
  needsPassword,
  unlockPdf,
  unlockWithPassword,
} from "@devtools/tools-core";
import { Button, FileDrop, Note, useFileList } from "@devtools/ui";
import { downloadResult, PdfTool, useFileBytes, useProcessor } from "../shared.js";

export default function UnlockPdf() {
  const { files, add, clear } = useFileList();
  const getBytes = useFileBytes();
  const { busy, error, results, run } = useProcessor();

  const [needsPwd, setNeedsPwd] = useState(false);
  const [password, setPassword] = useState("");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [wrongPassword, setWrongPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const file = files[0];

  function reset() {
    clear();
    setNeedsPwd(false);
    setPassword("");
    setProgress(null);
    setWrongPassword(false);
  }

  async function unlock() {
    if (!file) return;
    setWrongPassword(false);

    await run(async () => {
      const bytes = await getBytes(file);
      const { data, wasEncrypted } = await unlockPdf(bytes);

      if (!wasEncrypted) {
        throw new Error("This PDF has no restrictions to remove — it is already unlocked.");
      }

      const blob = new Blob([data as unknown as BlobPart], { type: "application/pdf" });
      const name = file.file.name.replace(/\.pdf$/i, "-unlocked.pdf");
      return [{ name, blob }];
    }).catch((err: unknown) => {
      if (err instanceof PdfPasswordRequiredError) {
        setNeedsPwd(true);
        setTimeout(() => passwordRef.current?.focus(), 50);
        return undefined;
      }
      throw err;
    });
  }

  async function unlockWithPwd(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !password) return;
    setWrongPassword(false);
    setProgress(null);

    await run(async () => {
      const bytes = await getBytes(file);
      const data = await unlockWithPassword(bytes, password, (done, total) =>
        setProgress({ done, total }),
      );
      setProgress(null);

      const blob = new Blob([data as unknown as BlobPart], { type: "application/pdf" });
      const name = file.file.name.replace(/\.pdf$/i, "-unlocked.pdf");
      return [{ name, blob }];
    }).catch((err: unknown) => {
      setProgress(null);
      if (needsPassword(err)) {
        setWrongPassword(true);
        setPassword("");
        setTimeout(() => passwordRef.current?.focus(), 50);
        return undefined;
      }
      throw err;
    });
  }

  return (
    <PdfTool slug="unlock-pdf">
      <FileDrop onFiles={add} accept={[".pdf"]} multiple={false} label="Drop a PDF here, or click to choose" />

      {file && !needsPwd && (
        <div className="dt-stack" style={{ gap: "var(--space-3)" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--text-soft)" }}>
            Selected: <strong>{file.file.name}</strong>
          </p>
          <div className="dt-row" style={{ gap: "var(--space-2)" }}>
            <Button variant="primary" disabled={busy} onClick={unlock}>
              {busy ? "Unlocking…" : "Unlock PDF"}
            </Button>
            <Button variant="ghost" onClick={reset} disabled={busy}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {needsPwd && (
        <form onSubmit={unlockWithPwd} className="dt-stack" style={{ gap: "var(--space-3)" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--text-soft)" }}>
            <strong>{file?.file.name}</strong> is protected with an open password.
          </p>

          <Note kind="info">
            The unlocked copy will be rebuilt from rendered page images — text will no longer be
            selectable. This is unavoidable when decrypting a user-password PDF in the browser.
          </Note>

          {wrongPassword && (
            <Note kind="error">Incorrect password — please try again.</Note>
          )}

          <div className="dt-stack" style={{ gap: "var(--space-2)" }}>
            <label htmlFor="pdf-password" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
              PDF password
            </label>
            <input
              id="pdf-password"
              ref={passwordRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password…"
              autoComplete="off"
              style={{
                padding: "var(--space-2) var(--space-3)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                fontSize: "1rem",
                background: "var(--surface)",
                color: "var(--text)",
                width: "100%",
                maxWidth: "22rem",
              }}
            />
          </div>

          {progress && (
            <p style={{ fontSize: "0.875rem", color: "var(--text-soft)" }}>
              Rendering page {progress.done} of {progress.total}…
            </p>
          )}

          <div className="dt-row" style={{ gap: "var(--space-2)" }}>
            <Button variant="primary" disabled={busy || !password}>
              {busy ? `Rendering ${progress ? `${progress.done}/${progress.total}` : "…"}` : "Unlock PDF"}
            </Button>
            <Button variant="ghost" onClick={reset} disabled={busy} type="button">
              Cancel
            </Button>
          </div>
        </form>
      )}

      {error ? <Note kind="error">{error}</Note> : null}

      {results.length > 0 && (() => {
        const result = results[0];
        if (!result) return null;
        return (
          <Note kind="success">
            PDF unlocked successfully.{" "}
            <button
              type="button"
              onClick={() => downloadResult(result)}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent)",
                cursor: "pointer",
                textDecoration: "underline",
                font: "inherit",
                padding: 0,
              }}
            >
              Download {result.name}
            </button>
          </Note>
        );
      })()}
    </PdfTool>
  );
}
