import { useMemo, useState } from "react";
import { decodeUrl, encodeUrl, parseQueryParams, type UrlEncodeMode } from "@devtools/tools-core";
import { Button, CopyButton, Note, Panel, Select, TextArea, ToolFrame } from "@devtools/ui";

type Direction = "encode" | "decode";

export default function UrlTool() {
  const [direction, setDirection] = useState<Direction>("encode");
  const [mode, setMode] = useState<UrlEncodeMode>("component");
  const [input, setInput] = useState("");

  const output = useMemo((): { value: string } | { error: string } | null => {
    if (!input) return null;
    try {
      return { value: direction === "encode" ? encodeUrl(input, mode) : decodeUrl(input, mode) };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }, [input, direction, mode]);

  const value = output && "value" in output ? output.value : "";
  const error = output && "error" in output ? output.error : null;

  // Parse whichever side is human-readable: the raw input when encoding, the
  // decoded output when decoding. Reading the encoded string finds no "="
  // (it is percent-escaped to %3D) and the table silently stays empty.
  const params = useMemo(() => {
    const source = direction === "encode" ? input : value || input;
    return source.includes("=") ? parseQueryParams(source) : [];
  }, [input, value, direction]);

  return (
    <ToolFrame
      title="URL Encoder / Decoder"
      tagline="Percent-encode and decode URLs, query parameters and path segments."
    >
      <div className="dt-row">
        <Button
          variant={direction === "encode" ? "primary" : "ghost"}
          onClick={() => setDirection("encode")}
          aria-pressed={direction === "encode"}
        >
          Encode
        </Button>
        <Button
          variant={direction === "decode" ? "primary" : "ghost"}
          onClick={() => setDirection("decode")}
          aria-pressed={direction === "decode"}
        >
          Decode
        </Button>
        <Select
          value={mode}
          onChange={(e) => setMode(e.target.value as UrlEncodeMode)}
          aria-label="Encoding mode"
          style={{ width: "auto" }}
        >
          <option value="component">Component — encodes &amp; = ? /</option>
          <option value="uri">Full URI — preserves &amp; = ? /</option>
        </Select>
      </div>

      <Note kind="info">
        Use <strong>Component</strong> for a single query value or path segment, and{" "}
        <strong>Full URI</strong> when the input is a complete URL you want to keep working.
      </Note>

      <div className="dt-split">
        <Panel
          title="Input"
          actions={
            <Button variant="quiet" onClick={() => setInput("")} disabled={!input}>
              Clear
            </Button>
          }
        >
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://example.com/search?q=hello world&lang=en"
            invalid={Boolean(error)}
            softWrap
            style={{ minHeight: "9rem" }}
            aria-label="URL input"
          />
        </Panel>

        <Panel title="Output" actions={<CopyButton value={value} />}>
          <TextArea
            value={value}
            readOnly
            softWrap
            style={{ minHeight: "9rem" }}
            placeholder="Output appears here"
            aria-label="URL output"
          />
        </Panel>
      </div>

      {error ? <Note kind="error">{error}</Note> : null}

      {params.length > 0 && (
        <Panel title={`Query parameters — ${params.length}`} flush>
          <div style={{ overflowX: "auto" }}>
            <table className="dt-code" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "0.35rem 0.5rem", opacity: 0.6 }}>Key</th>
                  <th style={{ textAlign: "left", padding: "0.35rem 0.5rem", opacity: 0.6 }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {params.map((param, i) => (
                  <tr key={`${param.key}-${i}`}>
                    <td style={{ padding: "0.35rem 0.5rem", verticalAlign: "top" }}>{param.key}</td>
                    <td style={{ padding: "0.35rem 0.5rem", wordBreak: "break-all" }}>
                      {param.value || <span style={{ opacity: 0.5 }}>(empty)</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </ToolFrame>
  );
}
