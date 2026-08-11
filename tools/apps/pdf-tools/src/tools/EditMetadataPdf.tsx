import { useEffect, useState } from "react";
import { readPdfMetadata, setPdfMetadata, type EditablePdfMetadata } from "@devtools/tools-core";
import { Button, Field, FileDrop, Panel, Spinner, TextInput, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useFileBytes, useProcessor } from "../shared.js";

const EMPTY: EditablePdfMetadata = { title: "", author: "", subject: "", keywords: "", creator: "", producer: "" };

export default function EditMetadataPdf() {
  const { files, replace, clear } = useFileList();
  const getBytes = useFileBytes();
  const processor = useProcessor();

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [meta, setMeta] = useState<EditablePdfMetadata>(EMPTY);

  const file = files[0];

  useEffect(() => {
    if (!file) {
      setMeta(EMPTY);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    (async () => {
      try {
        const bytes = await getBytes(file);
        const read = await readPdfMetadata(bytes);
        if (!cancelled) setMeta(read);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file?.id]);

  function set<K extends keyof EditablePdfMetadata>(key: K, value: string) {
    setMeta((cur) => ({ ...cur, [key]: value }));
  }

  async function apply() {
    if (!file) return;
    await processor.run(async () => {
      const bytes = await getBytes(file);
      const data = await setPdfMetadata(bytes, {
        title: meta.title,
        author: meta.author,
        subject: meta.subject,
        keywords: meta.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        creator: meta.creator,
        producer: meta.producer,
      });
      const name = file.file.name.replace(/\.pdf$/i, "-metadata.pdf");
      return [{ name, blob: new Blob([data as BlobPart], { type: "application/pdf" }) }];
    });
  }

  return (
    <PdfTool slug="edit-pdf-metadata">
      <FileDrop accept={[".pdf"]} multiple={false} onFiles={replace} label="Drop a PDF here to edit its metadata" disabled={processor.busy} />

      {file && loading && <Spinner label="Reading metadata…" />}
      {file && loadError && <p style={{ color: "var(--danger)", fontSize: "0.875rem" }}>{loadError}</p>}

      {file && !loading && !loadError && (
        <Panel title={file.file.name}>
          <div className="dt-stack">
            <div className="dt-row">
              <Field label="Title">
                {(id) => <TextInput id={id} value={meta.title} onChange={(e) => set("title", e.target.value)} />}
              </Field>
              <Field label="Author">
                {(id) => <TextInput id={id} value={meta.author} onChange={(e) => set("author", e.target.value)} />}
              </Field>
            </div>
            <div className="dt-row">
              <Field label="Subject">
                {(id) => <TextInput id={id} value={meta.subject} onChange={(e) => set("subject", e.target.value)} />}
              </Field>
              <Field label="Keywords" hint="comma-separated">
                {(id) => <TextInput id={id} value={meta.keywords} onChange={(e) => set("keywords", e.target.value)} placeholder="invoice, 2026, draft" />}
              </Field>
            </div>
            <div className="dt-row">
              <Field label="Creator" hint="the application that created the document">
                {(id) => <TextInput id={id} value={meta.creator} onChange={(e) => set("creator", e.target.value)} />}
              </Field>
              <Field label="Producer" hint="the tool that produced this PDF file">
                {(id) => <TextInput id={id} value={meta.producer} onChange={(e) => set("producer", e.target.value)} />}
              </Field>
            </div>

            <div className="dt-row">
              <Button variant="primary" onClick={apply} disabled={processor.busy}>
                {processor.busy ? "Saving…" : "Save Metadata"}
              </Button>
              <Button onClick={clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="metadata-pdf.zip" />
    </PdfTool>
  );
}
