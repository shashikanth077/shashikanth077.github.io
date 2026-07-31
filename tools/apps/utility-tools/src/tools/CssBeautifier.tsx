import { useMemo, useState } from "react";
import { beautifyCss, findTool } from "@devtools/tools-core";
import {
  Button,
  Checkbox,
  CopyButton,
  DownloadButton,
  Note,
  Panel,
  Select,
  TextArea,
  ToolFrame,
  useDebounced,
} from "@devtools/ui";

const SAMPLE = `body{margin:0;padding:0;font-family:system-ui,sans-serif}.container{max-width:1200px;margin:0 auto;padding:1rem}.btn,button.primary{display:inline-flex;align-items:center;background:#3B82F6;color:white;padding:.5rem 1rem;border:none;border-radius:4px;cursor:pointer}@media(max-width:768px){.container{padding:.5rem}}`;

export default function CssBeautifier() {
  const route = findTool("css-beautifier");
  const [input, setInput] = useState("");
  const [indentSize, setIndentSize] = useState<number>(2);
  const [useTabs, setUseTabs] = useState<boolean>(false);
  const debounced = useDebounced(input, 200);

  type Result =
    | { status: "empty" }
    | { status: "ok"; formatted: string }
    | { status: "error"; error: string };

  const result = useMemo<Result>(() => {
    if (!debounced.trim()) return { status: "empty" };
    try {
      const formatted = beautifyCss(debounced, { indentSize, useTabs });
      return { status: "ok", formatted };
    } catch (error) {
      return {
        status: "error",
        error: error instanceof Error ? error.message : "Could not format this CSS.",
      };
    }
  }, [debounced, indentSize, useTabs]);

  const formatted = result.status === "ok" ? result.formatted : "";
  const error = result.status === "error" ? result.error : null;

  return (
    <ToolFrame
      title={route?.name ?? "CSS Beautifier"}
      tagline={route?.tagline ?? ""}
    >
      <div className="dt-row">
        <Select
          value={String(indentSize)}
          onChange={(e) => setIndentSize(Number(e.target.value))}
          aria-label="Indent size"
          disabled={useTabs}
          style={{ width: "auto" }}
        >
          <option value="2">2 spaces</option>
          <option value="4">4 spaces</option>
          <option value="8">8 spaces</option>
        </Select>
        <Checkbox label="Use tabs" checked={useTabs} onChange={setUseTabs} />
        <Button onClick={() => setInput(formatted)} disabled={!formatted}>
          Apply to input
        </Button>
        <Button variant="quiet" onClick={() => setInput(SAMPLE)}>
          Load sample
        </Button>
      </div>

      <div className="dt-split">
        <Panel
          title="Input CSS"
          actions={
            <Button variant="quiet" onClick={() => setInput("")} disabled={!input}>
              Clear
            </Button>
          }
        >
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste minified or messy CSS…"
            invalid={Boolean(error)}
            style={{ minHeight: "22rem" }}
            aria-label="CSS input"
          />
        </Panel>

        <Panel
          title="Beautified"
          flush
          actions={
            <>
              <CopyButton value={formatted} />
              <DownloadButton
                data={formatted}
                filename="beautified.css"
                mime="text/css"
                disabled={!formatted}
              />
            </>
          }
        >
          <pre
            className="dt-code"
            style={{ minHeight: "22rem", maxHeight: "34rem", overflow: "auto" }}
          >
            {formatted}
          </pre>
        </Panel>
      </div>

      {error && <Note kind="error">{error}</Note>}
    </ToolFrame>
  );
}
