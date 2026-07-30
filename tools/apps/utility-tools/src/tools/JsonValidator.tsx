import { useMemo, useState } from "react";
import { validateAgainstSchema, type ValidationResult } from "@devtools/tools-core";
import { Button, Note, Panel, TextArea, ToolFrame, useDebounced } from "@devtools/ui";

const SAMPLE_SCHEMA = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["email", "age"],
  "properties": {
    "email": { "type": "string", "format": "email" },
    "age": { "type": "integer", "minimum": 0 },
    "tags": { "type": "array", "items": { "type": "string" } }
  },
  "additionalProperties": false
}`;

const SAMPLE_DATA = `{
  "email": "not-an-email",
  "age": -3,
  "nickname": "ada"
}`;

export default function JsonValidator() {
  const [schema, setSchema] = useState("");
  const [data, setData] = useState("");

  const debouncedSchema = useDebounced(schema, 300);
  const debouncedData = useDebounced(data, 300);

  const outcome = useMemo((): { result: ValidationResult } | { error: string } | null => {
    if (!debouncedSchema.trim() || !debouncedData.trim()) return null;
    try {
      return { result: validateAgainstSchema(debouncedData, debouncedSchema) };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }, [debouncedSchema, debouncedData]);

  function loadSample() {
    setSchema(SAMPLE_SCHEMA);
    setData(SAMPLE_DATA);
  }

  return (
    <ToolFrame
      title="JSON Schema Validator"
      tagline="Validate a JSON document against a JSON Schema and get path-level error messages."
    >
      <div className="dt-row">
        <Button variant="quiet" onClick={loadSample}>
          Load sample
        </Button>
        <Button
          variant="quiet"
          onClick={() => {
            setSchema("");
            setData("");
          }}
          disabled={!schema && !data}
        >
          Clear both
        </Button>
        <span className="dt-hint">Draft 2020-12, validated with Ajv. Formats enabled.</span>
      </div>

      <div className="dt-split">
        <Panel title="Schema">
          <TextArea
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            placeholder="Paste a JSON Schema…"
            style={{ minHeight: "20rem" }}
            aria-label="JSON Schema"
          />
        </Panel>
        <Panel title="Document">
          <TextArea
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="Paste the JSON to validate…"
            style={{ minHeight: "20rem" }}
            aria-label="JSON document"
          />
        </Panel>
      </div>

      {outcome === null && (
        <Note kind="info">Provide both a schema and a document to run validation.</Note>
      )}

      {outcome && "error" in outcome && <Note kind="error">{outcome.error}</Note>}

      {outcome && "result" in outcome && outcome.result.valid && (
        <Note kind="success">Valid — the document satisfies the schema.</Note>
      )}

      {outcome && "result" in outcome && !outcome.result.valid && (
        <Panel title={`${outcome.result.issues.length} validation error${outcome.result.issues.length === 1 ? "" : "s"}`} flush>
          <ul style={{ margin: 0, padding: "0.5rem 0", listStyle: "none" }}>
            {outcome.result.issues.map((issue, i) => (
              <li
                key={`${issue.path}-${issue.keyword}-${i}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(8rem, max-content) 1fr",
                  gap: "0 1rem",
                  padding: "0.4rem 0.75rem",
                  fontSize: "0.8125rem",
                  fontFamily: "var(--font-mono)",
                  borderTop: i === 0 ? "none" : "1px solid var(--line)",
                }}
              >
                <code style={{ color: "var(--danger)", wordBreak: "break-all" }}>{issue.path}</code>
                <span>
                  {issue.message}{" "}
                  <span style={{ color: "var(--text-faint)" }}>({issue.keyword})</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </ToolFrame>
  );
}
