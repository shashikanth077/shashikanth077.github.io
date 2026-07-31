import { useMemo, useState } from "react";
import {
  computeLineDiff,
  computeWordDiff,
  findTool,
  toSideBySide,
  type DiffLine,
  type SideBySideRow,
  type WordChange,
} from "@devtools/tools-core";
import {
  Button,
  Checkbox,
  Panel,
  Select,
  StatRow,
  TextArea,
  ToolFrame,
  useDebounced,
} from "@devtools/ui";
import "./DiffChecker.css";

type ViewMode = "side" | "unified";

const SAMPLE_LEFT = `function greet(name) {
  console.log("Hello, " + name);
  return name.length;
}

const users = ["Ada", "Grace"];
users.forEach(greet);`;

const SAMPLE_RIGHT = `function greet(name, greeting = "Hello") {
  console.log(\`\${greeting}, \${name}!\`);
  return name.length;
}

const users = ["Ada", "Grace", "Linus"];
users.forEach((user) => greet(user));`;

export default function DiffChecker() {
  const route = findTool("diff-checker");
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [view, setView] = useState<ViewMode>("side");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const debouncedLeft = useDebounced(left, 200);
  const debouncedRight = useDebounced(right, 200);

  const { lines, summary } = useMemo(() => {
    const normalise = (s: string): string => {
      let out = s;
      if (ignoreCase) out = out.toLowerCase();
      if (ignoreWhitespace) {
        out = out
          .split("\n")
          .map((line) => line.replace(/[\t ]+/g, " ").trim())
          .join("\n");
      }
      return out;
    };
    return computeLineDiff(normalise(debouncedLeft), normalise(debouncedRight));
  }, [debouncedLeft, debouncedRight, ignoreWhitespace, ignoreCase]);

  const rows = useMemo(() => toSideBySide(lines), [lines]);
  const hasInput = debouncedLeft.trim().length > 0 || debouncedRight.trim().length > 0;
  const identical = hasInput && summary.added === 0 && summary.removed === 0;

  function loadSample() {
    setLeft(SAMPLE_LEFT);
    setRight(SAMPLE_RIGHT);
  }

  function swap() {
    setLeft(right);
    setRight(left);
  }

  function clearAll() {
    setLeft("");
    setRight("");
  }

  return (
    <ToolFrame
      title={route?.name ?? "Diff Checker"}
      tagline={route?.tagline ?? ""}
    >
      <div className="dt-row">
        <Select
          value={view}
          onChange={(e) => setView(e.target.value as ViewMode)}
          aria-label="View mode"
          style={{ width: "auto" }}
        >
          <option value="side">Side by side</option>
          <option value="unified">Unified</option>
        </Select>
        <Checkbox
          label="Ignore whitespace"
          checked={ignoreWhitespace}
          onChange={setIgnoreWhitespace}
        />
        <Checkbox label="Ignore case" checked={ignoreCase} onChange={setIgnoreCase} />
        <Button onClick={swap} disabled={!hasInput}>
          Swap
        </Button>
        <Button variant="quiet" onClick={loadSample}>
          Load sample
        </Button>
        <Button variant="quiet" onClick={clearAll} disabled={!hasInput}>
          Clear
        </Button>
      </div>

      <div className="dt-split">
        <Panel title="Original">
          <TextArea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder="Paste the original text…"
            style={{ minHeight: "12rem" }}
            aria-label="Left input"
          />
        </Panel>
        <Panel title="Changed">
          <TextArea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder="Paste the changed text…"
            style={{ minHeight: "12rem" }}
            aria-label="Right input"
          />
        </Panel>
      </div>

      {hasInput && (
        <StatRow
          items={[
            { label: "Added", value: `+${summary.added}` },
            { label: "Removed", value: `−${summary.removed}` },
            { label: "Unchanged", value: `${summary.unchanged}` },
          ]}
        />
      )}

      {identical && (
        <div className="diff-empty">The two inputs are identical.</div>
      )}

      {hasInput && !identical && (
        <Panel title={view === "side" ? "Side-by-side diff" : "Unified diff"} flush>
          {view === "side" ? (
            <SideBySideView rows={rows} />
          ) : (
            <UnifiedView lines={lines} />
          )}
        </Panel>
      )}
    </ToolFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Side-by-side rendering                                               */
/* ------------------------------------------------------------------ */

function SideBySideView({ rows }: { rows: SideBySideRow[] }) {
  return (
    <div className="diff-scroll">
      <table className="diff-table diff-table--side">
        <tbody>
          {rows.map((row, i) => (
            <SideRow key={i} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SideRow({ row }: { row: SideBySideRow }) {
  const { left, right } = row;
  const leftKind = left?.kind ?? "unchanged";
  const rightKind = right?.kind ?? "unchanged";
  // Word-level highlight only makes sense for paired edit rows where both
  // sides have text; otherwise render the whole line with its row colour.
  const showWords =
    left !== null && right !== null && left.kind === "removed" && right.kind === "added";

  const leftWords = showWords ? computeWordDiff(left.text, right.text) : null;
  const rightWords = showWords ? computeWordDiff(left.text, right.text) : null;

  return (
    <tr>
      <td className={`diff-num diff-num--${leftKind}`}>
        {left?.leftNumber ?? ""}
      </td>
      <td className={`diff-cell diff-cell--${leftKind}`}>
        {left === null ? (
          <span className="diff-empty-cell" aria-hidden="true">
            &nbsp;
          </span>
        ) : leftWords ? (
          <WordSpans words={leftWords} showKinds={["unchanged", "removed"]} />
        ) : (
          <span>{left.text || " "}</span>
        )}
      </td>
      <td className={`diff-num diff-num--${rightKind}`}>
        {right?.rightNumber ?? ""}
      </td>
      <td className={`diff-cell diff-cell--${rightKind}`}>
        {right === null ? (
          <span className="diff-empty-cell" aria-hidden="true">
            &nbsp;
          </span>
        ) : rightWords ? (
          <WordSpans words={rightWords} showKinds={["unchanged", "added"]} />
        ) : (
          <span>{right.text || " "}</span>
        )}
      </td>
    </tr>
  );
}

function WordSpans({
  words,
  showKinds,
}: {
  words: WordChange[];
  showKinds: Array<"unchanged" | "added" | "removed">;
}) {
  return (
    <>
      {words
        .filter((w) => showKinds.includes(w.kind))
        .map((w, i) => (
          <span key={i} className={`diff-word diff-word--${w.kind}`}>
            {w.text}
          </span>
        ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Unified rendering                                                    */
/* ------------------------------------------------------------------ */

function UnifiedView({ lines }: { lines: DiffLine[] }) {
  return (
    <div className="diff-scroll">
      <table className="diff-table diff-table--unified">
        <tbody>
          {lines.map((line, i) => (
            <tr key={i}>
              <td className={`diff-num diff-num--${line.kind}`}>
                {line.leftNumber ?? ""}
              </td>
              <td className={`diff-num diff-num--${line.kind}`}>
                {line.rightNumber ?? ""}
              </td>
              <td className={`diff-marker diff-marker--${line.kind}`}>
                {line.kind === "added" ? "+" : line.kind === "removed" ? "−" : " "}
              </td>
              <td className={`diff-cell diff-cell--${line.kind}`}>
                <span>{line.text || " "}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
