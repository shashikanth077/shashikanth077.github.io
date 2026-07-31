import { useMemo, useState } from "react";
import { beautifyJs, findTool } from "@devtools/tools-core";
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

const SAMPLE = `function fib(n){if(n<2)return n;let a=0,b=1;for(let i=2;i<=n;i++){[a,b]=[b,a+b]}return b}const users=[{id:1,name:'Ada',role:'admin'},{id:2,name:'Grace',role:'dev'}];users.filter(u=>u.role==='admin').forEach(u=>console.log(u.name));`;

export default function JsBeautifier() {
  const route = findTool("js-beautifier");
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
      const formatted = beautifyJs(debounced, { indentSize, useTabs });
      return { status: "ok", formatted };
    } catch (error) {
      return {
        status: "error",
        error: error instanceof Error ? error.message : "Could not format this JavaScript.",
      };
    }
  }, [debounced, indentSize, useTabs]);

  const formatted = result.status === "ok" ? result.formatted : "";
  const error = result.status === "error" ? result.error : null;

  return (
    <ToolFrame
      title={route?.name ?? "JavaScript Beautifier"}
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
            placeholder="Paste minified or messy JavaScript / TypeScript / JSON…"
            invalid={Boolean(error)}
            style={{ minHeight: "22rem" }}
            aria-label="JavaScript input"
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
                filename="beautified.js"
                mime="application/javascript"
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
