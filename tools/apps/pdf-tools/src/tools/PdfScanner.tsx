import { useEffect, useRef, useState } from "react";
import { imagesToPdf, toPickedFile, type PageSizeName } from "@devtools/tools-core";
import { Button, Field, FileList, Note, Panel, Select, useFileList } from "@devtools/ui";
import { PdfTool, ProcessorOutput, useProcessor } from "../shared.js";

/**
 * Camera → PDF, entirely client-side: getUserMedia streams straight into a
 * <video> element, "Capture" grabs one frame onto a canvas and turns it into
 * a page, and the rest is exactly ImagesToPdf's own flow (the same
 * useFileList/FileList reorder-and-remove UI, the same imagesToPdf() call)
 * — a scanned page is just an image that happened to come from a camera
 * instead of a file picker. Nothing is ever sent anywhere: the stream stays
 * in this tab, and a capture becomes a PDF page without leaving the browser.
 */
export default function PdfScanner() {
  const list = useFileList();
  const processor = useProcessor();
  const [pageSize, setPageSize] = useState<PageSizeName>("a4");
  const [streaming, setStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStreaming(true);
    } catch (err) {
      setCameraError(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera access was denied. Allow camera access for this site and try again."
          : "Could not start the camera. Your browser or device may not support it, or no camera is available.",
      );
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStreaming(false);
  }

  function capture() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const n = list.files.length + 1;
      const file = new File([blob], `scan-${n}.jpg`, { type: "image/jpeg" });
      const picked = toPickedFile(file);
      picked.previewUrl = URL.createObjectURL(blob);
      list.add([picked]);
    }, "image/jpeg", 0.92);
  }

  async function build() {
    await processor.run(async (report) => {
      const images: Array<{ bytes: ArrayBuffer; type: string }> = [];
      for (const [i, file] of list.files.entries()) {
        images.push({ bytes: await file.file.arrayBuffer(), type: file.file.type });
        report(i + 1, list.files.length + 1);
      }
      const pdf = await imagesToPdf(images, { pageSize, fit: "fit" });
      report(list.files.length + 1, list.files.length + 1);
      return [
        {
          name: "scan.pdf",
          blob: new Blob([pdf as BlobPart], { type: "application/pdf" }),
          note: `${images.length} page${images.length === 1 ? "" : "s"}`,
        },
      ];
    });
  }

  return (
    <PdfTool slug="pdf-scanner">
      {!streaming && (
        <Panel title="Scan with your camera">
          <div className="dt-stack">
            <Note kind="info">
              Uses your device&rsquo;s camera to capture pages, then builds a PDF from them — the video stream never leaves this
              browser tab.
            </Note>
            {cameraError && <Note kind="error">{cameraError}</Note>}
            <div className="dt-row">
              <Button variant="primary" onClick={startCamera}>
                Start Camera
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <div style={{ display: streaming ? "block" : "none" }}>
        <Panel title="Camera">
          <div className="dt-stack">
            <video
              ref={videoRef}
              playsInline
              muted
              style={{ width: "100%", maxWidth: "32rem", borderRadius: "var(--radius, 8px)", background: "#000" }}
            />
            <div className="dt-row">
              <Button variant="primary" onClick={capture}>
                📸 Capture Page
              </Button>
              <Button onClick={stopCamera}>Stop Camera</Button>
            </div>
          </div>
        </Panel>
      </div>

      {list.files.length > 0 && (
        <Panel title={`${list.files.length} page${list.files.length === 1 ? "" : "s"} captured`}>
          <div className="dt-stack">
            <FileList files={list.files} onRemove={list.remove} onMove={list.move} reorderable />

            <Field label="Page size">
              {(id) => (
                <Select id={id} value={pageSize} onChange={(e) => setPageSize(e.target.value as PageSizeName)}>
                  <option value="a4">A4</option>
                  <option value="letter">US Letter</option>
                  <option value="auto">Match each capture</option>
                </Select>
              )}
            </Field>

            <div className="dt-row">
              <Button variant="primary" onClick={build} disabled={processor.busy}>
                {processor.busy ? "Building…" : "Create PDF"}
              </Button>
              <Button onClick={list.clear} disabled={processor.busy}>
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <ProcessorOutput error={processor.error} results={processor.results} zipName="scan-pdf.zip" />
    </PdfTool>
  );
}
