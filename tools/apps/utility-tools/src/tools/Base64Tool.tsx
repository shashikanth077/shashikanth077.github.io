import { useMemo, useState } from "react";
import { decodeBase64, encodeBase64, isProbablyBase64 } from "@devtools/tools-core";
import { Button, Checkbox, CopyButton, Note, Panel, TextArea, ToolFrame } from "@devtools/ui";

type Direction = "encode" | "decode";

export default function Base64Tool() {
  const [direction, setDirection] = useState<Direction>("encode");
  const [input, setInput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);

  const output = useMemo((): { value: string } | { error: string } | null => {
    if (!input) return null;
    try {
      return {
        value: direction === "encode" ? encodeBase64(input, urlSafe) : decodeBase64(input),
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }, [input, direction, urlSafe]);

  const value = output && "value" in output ? output.value : "";
  const error = output && "error" in output ? output.error : null;

  // Offer the obvious correction when someone pastes Base64 into encode mode.
  const looksReversed =
    direction === "encode" && input.length > 16 && isProbablyBase64(input) && input.length % 4 === 0;

  function swap() {
    setDirection((d) => (d === "encode" ? "decode" : "encode"));
    if (value) setInput(value);
  }

  return (
    <ToolFrame
      title="Base64 Encoder / Decoder"
      tagline="Convert text to and from Base64, with full Unicode and URL-safe support."
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
        {direction === "encode" && (
          <Checkbox label="URL-safe (-_ , no padding)" checked={urlSafe} onChange={setUrlSafe} />
        )}
        <Button onClick={swap} disabled={!value}>
          Swap ⇄
        </Button>
      </div>

      {looksReversed && (
        <Note kind="info">
          That input already looks like Base64 — did you mean to <strong>decode</strong> it?
        </Note>
      )}

      <div className="dt-split">
        <Panel
          title={direction === "encode" ? "Plain text" : "Base64"}
          actions={
            <Button variant="quiet" onClick={() => setInput("")} disabled={!input}>
              Clear
            </Button>
          }
        >
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={direction === "encode" ? "Type or paste text…" : "Paste Base64…"}
            invalid={Boolean(error)}
            softWrap
            aria-label={direction === "encode" ? "Text to encode" : "Base64 to decode"}
          />
        </Panel>

        <Panel
          title={direction === "encode" ? "Base64" : "Plain text"}
          actions={<CopyButton value={value} />}
        >
          <TextArea value={value} readOnly softWrap placeholder="Output appears here" aria-label="Output" />
        </Panel>
      </div>

      {error ? <Note kind="error">{error}</Note> : null}
    </ToolFrame>
  );
}
