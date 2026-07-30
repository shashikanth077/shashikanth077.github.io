import { useMemo, useState } from "react";
import {
  describeParseError,
  formatJson,
  minificationSaving,
  minifyJson,
  type FormatOptions,
  type JsonParseError,
} from "@devtools/tools-core";
import {
  Button,
  Checkbox,
  CopyButton,
  DownloadButton,
  Note,
  Panel,
  Select,
  StatRow,
  TextArea,
  ToolFrame,
  useDebounced,
} from "@devtools/ui";

const SAMPLE = '{"name":"Ada","roles":["admin","dev"],"active":true,"meta":{"id":42,"score":9.5}}';

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<FormatOptions["indent"]>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const debounced = useDebounced(input, 200);

  // Explicitly discriminated. An un-annotated useMemo returning three different
  // object shapes infers a union TypeScript will not narrow through `in`.
  type Result =
    | { status: "empty" }
    | { status: "ok"; formatted: string; saving: ReturnType<typeof minificationSaving> }
    | { status: "error"; error: JsonParseError };

  const result = useMemo<Result>(() => {
    if (!debounced.trim()) return { status: "empty" };
    try {
      return {
        status: "ok",
        formatted: formatJson(debounced, { indent, sortKeys }),
        saving: minificationSaving(debounced),
      };
    } catch (error) {
      return { status: "error", error: describeParseError(error, debounced) };
    }
  }, [debounced, indent, sortKeys]);

  const formatted = result.status === "ok" ? result.formatted : "";
  const parseError = result.status === "error" ? result.error : null;

  function applyMinify() {
    try {
      setInput(minifyJson(input));
    } catch {
      /* the error panel already explains why */
    }
  }

  return (
    <ToolFrame
      title="JSON Formatter"
      tagline="Pretty-print, minify and sort JSON. Parsing happens locally — production data stays on your machine."
    >
      <div className="dt-row">
        <Select
          value={String(indent)}
          onChange={(e) => setIndent(e.target.value === "tab" ? "tab" : Number(e.target.value))}
          aria-label="Indentation"
          style={{ width: "auto" }}
        >
          <option value="2">2 spaces</option>
          <option value="4">4 spaces</option>
          <option value="tab">Tabs</option>
          <option value="0">None</option>
        </Select>
        <Checkbox label="Sort keys A→Z" checked={sortKeys} onChange={setSortKeys} />
        <Button onClick={() => setInput(formatted)} disabled={!formatted}>
          Apply to input
        </Button>
        <Button onClick={applyMinify} disabled={!formatted}>
          Minify
        </Button>
        <Button variant="quiet" onClick={() => setInput(SAMPLE)}>
          Load sample
        </Button>
      </div>

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
            placeholder="Paste JSON…"
            invalid={Boolean(parseError)}
            style={{ minHeight: "22rem" }}
            aria-label="JSON input"
          />
        </Panel>

        <Panel
          title="Formatted"
          flush
          actions={
            <>
              <CopyButton value={formatted} />
              <DownloadButton
                data={formatted}
                filename="formatted.json"
                mime="application/json"
                disabled={!formatted}
              />
            </>
          }
        >
          <pre className="dt-code" style={{ minHeight: "22rem", maxHeight: "34rem", overflow: "auto" }}>
            {formatted}
          </pre>
        </Panel>
      </div>

      {parseError ? (
        <Note kind="error">
          {parseError.message}
          {parseError.line !== null && (
            <>
              {" "}
              — line <strong>{parseError.line}</strong>, column <strong>{parseError.column}</strong>
            </>
          )}
        </Note>
      ) : null}

      {result.status === "ok" && (
        <StatRow
          items={[
            { label: "Original", value: `${result.saving.before.toLocaleString()} B` },
            { label: "Minified", value: `${result.saving.after.toLocaleString()} B` },
            { label: "Saving", value: `${result.saving.percent}%` },
          ]}
        />
      )}
    </ToolFrame>
  );
}
