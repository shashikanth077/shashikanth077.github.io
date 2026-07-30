import { useEffect, useRef, useState } from "react";
import {
  qrToPngDataUrl,
  qrToSvg,
  renderQrToCanvas,
  vCardPayload,
  wifiPayload,
  type QrErrorCorrection,
} from "@devtools/tools-core";
import {
  Button,
  Field,
  Note,
  Panel,
  Select,
  TextArea,
  TextInput,
  ToolFrame,
  useDebounced,
} from "@devtools/ui";

type PayloadKind = "text" | "wifi" | "vcard";

const CORRECTION_HINT: Record<QrErrorCorrection, string> = {
  L: "~7% recoverable — smallest code",
  M: "~15% recoverable — a good default",
  Q: "~25% recoverable",
  H: "~30% recoverable — largest code, best for printing on textured surfaces",
};

export default function QrGenerator() {
  const [kind, setKind] = useState<PayloadKind>("text");
  const [text, setText] = useState("https://shashikanth077.github.io/tools");
  const [wifi, setWifi] = useState({ ssid: "", password: "", security: "WPA" as "WPA" | "WEP" | "nopass" });
  const [vcard, setVcard] = useState({ fullName: "", organisation: "", phone: "", email: "", url: "" });

  const [size, setSize] = useState(320);
  const [correction, setCorrection] = useState<QrErrorCorrection>("M");
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const payload =
    kind === "text"
      ? text
      : kind === "wifi"
        ? wifi.ssid
          ? wifiPayload(wifi.ssid, wifi.password, wifi.security)
          : ""
        : vcard.fullName
          ? vCardPayload(vcard)
          : "";

  const debouncedPayload = useDebounced(payload, 200);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!debouncedPayload) {
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      setError(null);
      return;
    }

    let cancelled = false;
    renderQrToCanvas(canvas, debouncedPayload, { size, errorCorrection: correction })
      .then(() => {
        if (!cancelled) setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // Almost always "data too long for this error-correction level".
        setError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedPayload, size, correction]);

  async function download(format: "png" | "svg") {
    if (!debouncedPayload) return;
    const opts = { size, errorCorrection: correction };
    const anchor = document.createElement("a");

    if (format === "png") {
      anchor.href = await qrToPngDataUrl(debouncedPayload, opts);
      anchor.download = "qr-code.png";
    } else {
      const svg = await qrToSvg(debouncedPayload, opts);
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      anchor.href = url;
      anchor.download = "qr-code.svg";
      setTimeout(() => URL.revokeObjectURL(url), 0);
    }
    anchor.click();
  }

  return (
    <ToolFrame
      title="QR Code Generator"
      tagline="Turn text, a URL, WiFi credentials or contact details into a downloadable QR code."
    >
      <div className="dt-split dt-split--wide-right">
        <Panel title="Content">
          <div className="dt-stack">
            <Field label="Payload type">
              {(id) => (
                <Select id={id} value={kind} onChange={(e) => setKind(e.target.value as PayloadKind)}>
                  <option value="text">Text or URL</option>
                  <option value="wifi">WiFi network</option>
                  <option value="vcard">Contact card</option>
                </Select>
              )}
            </Field>

            {kind === "text" && (
              <Field label="Text or URL">
                {(id) => (
                  <TextArea
                    id={id}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    softWrap
                    style={{ minHeight: "6rem" }}
                  />
                )}
              </Field>
            )}

            {kind === "wifi" && (
              <>
                <Field label="Network name (SSID)">
                  {(id) => (
                    <TextInput id={id} value={wifi.ssid} onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })} />
                  )}
                </Field>
                <Field label="Security">
                  {(id) => (
                    <Select
                      id={id}
                      value={wifi.security}
                      onChange={(e) => setWifi({ ...wifi, security: e.target.value as typeof wifi.security })}
                    >
                      <option value="WPA">WPA / WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">Open (no password)</option>
                    </Select>
                  )}
                </Field>
                {wifi.security !== "nopass" && (
                  <Field label="Password" hint="Encoded into the QR code in plain text — anyone who scans it gets the password.">
                    {(id) => (
                      <TextInput
                        id={id}
                        value={wifi.password}
                        onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                      />
                    )}
                  </Field>
                )}
              </>
            )}

            {kind === "vcard" && (
              <>
                <Field label="Full name">
                  {(id) => (
                    <TextInput id={id} value={vcard.fullName} onChange={(e) => setVcard({ ...vcard, fullName: e.target.value })} />
                  )}
                </Field>
                <Field label="Organisation">
                  {(id) => (
                    <TextInput id={id} value={vcard.organisation} onChange={(e) => setVcard({ ...vcard, organisation: e.target.value })} />
                  )}
                </Field>
                <Field label="Phone">
                  {(id) => <TextInput id={id} value={vcard.phone} onChange={(e) => setVcard({ ...vcard, phone: e.target.value })} />}
                </Field>
                <Field label="Email">
                  {(id) => <TextInput id={id} type="email" value={vcard.email} onChange={(e) => setVcard({ ...vcard, email: e.target.value })} />}
                </Field>
                <Field label="Website">
                  {(id) => <TextInput id={id} value={vcard.url} onChange={(e) => setVcard({ ...vcard, url: e.target.value })} />}
                </Field>
              </>
            )}

            <Field label="Size" hint={`${size} × ${size} px`}>
              {(id) => (
                <input
                  id={id}
                  type="range"
                  min={128}
                  max={1024}
                  step={32}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--accent)" }}
                />
              )}
            </Field>

            <Field label="Error correction" hint={CORRECTION_HINT[correction]}>
              {(id) => (
                <Select
                  id={id}
                  value={correction}
                  onChange={(e) => setCorrection(e.target.value as QrErrorCorrection)}
                >
                  <option value="L">L — low</option>
                  <option value="M">M — medium</option>
                  <option value="Q">Q — quartile</option>
                  <option value="H">H — high</option>
                </Select>
              )}
            </Field>
          </div>
        </Panel>

        <Panel
          title="QR code"
          flush
          actions={
            <>
              <Button variant="quiet" onClick={() => void download("png")} disabled={!debouncedPayload}>
                PNG
              </Button>
              <Button variant="quiet" onClick={() => void download("svg")} disabled={!debouncedPayload}>
                SVG
              </Button>
            </>
          }
        >
          <div className="dt-canvas-frame">
            {debouncedPayload ? (
              <canvas ref={canvasRef} aria-label="Generated QR code" />
            ) : (
              <p className="dt-empty">Enter content to generate a code.</p>
            )}
          </div>
        </Panel>
      </div>

      {error ? (
        <Note kind="error">
          {error} — try a shorter payload or a lower error-correction level.
        </Note>
      ) : null}
    </ToolFrame>
  );
}
