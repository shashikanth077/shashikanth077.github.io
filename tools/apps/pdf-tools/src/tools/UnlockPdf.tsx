import { unlockPdf } from "@devtools/tools-core";
import { Button, FileDrop, Note, useFileList } from "@devtools/ui";
import { downloadResult, PdfTool, useFileBytes, useProcessor } from "../shared.js";

export default function UnlockPdf() {
  const { files, add, clear } = useFileList();
  const getBytes = useFileBytes();
  const { busy, error, results, run } = useProcessor();

  const file = files[0];

  async function unlock() {
    if (!file) return;

    await run(async () => {
      const bytes = await getBytes(file);
      const { data, wasEncrypted } = await unlockPdf(bytes);

      if (!wasEncrypted) {
        throw new Error("This PDF has no restrictions to remove — it is already unlocked.");
      }

      const blob = new Blob([data as unknown as BlobPart], { type: "application/pdf" });
      const name = file.file.name.replace(/\.pdf$/i, "-unlocked.pdf");
      return [{ name, blob }];
    });
  }

  return (
    <PdfTool slug="unlock-pdf">
      <FileDrop onFiles={add} accept={[".pdf"]} multiple={false} label="Drop a PDF here, or click to choose" />

      {file && (
        <div className="dt-stack" style={{ gap: "var(--space-3)" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--text-soft)" }}>
            Selected: <strong>{file.file.name}</strong>
          </p>

          <div className="dt-row" style={{ gap: "var(--space-2)" }}>
            <Button variant="primary" disabled={busy} onClick={unlock}>
              {busy ? "Unlocking…" : "Unlock PDF"}
            </Button>
            <Button variant="ghost" onClick={clear} disabled={busy}>
              Clear
            </Button>
          </div>
        </div>
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
