import { useEffect, useMemo, useRef, useState } from "react";
import { hardenExternalLinks, markdownStats, renderMarkdown } from "@devtools/tools-core";
import {
  Button,
  Checkbox,
  CopyButton,
  DownloadButton,
  Note,
  Panel,
  StatRow,
  TextArea,
  ToolFrame,
  useDebounced,
} from "@devtools/ui";

const SAMPLE = `# Release notes

A **short** example with a [link](https://example.com), \`inline code\`,
and a list:

- First item
- Second item
- Third item

> Blockquotes work too.

| Tool | Runs |
| ---- | ---- |
| JWT  | Browser |
| UUID | Browser |

\`\`\`ts
const id = crypto.randomUUID();
\`\`\`
`;

export default function MarkdownPreview() {
  const [source, setSource] = useState(SAMPLE);
  const [breaks, setBreaks] = useState(true);
  const [showHtml, setShowHtml] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const debounced = useDebounced(source, 150);
  const html = useMemo(() => renderMarkdown(debounced, { breaks }), [debounced, breaks]);
  const stats = useMemo(() => markdownStats(source), [source]);

  // Sanitisation strips target/rel, so re-apply them to the live nodes after render.
  useEffect(() => {
    if (previewRef.current) hardenExternalLinks(previewRef.current);
  }, [html]);

  return (
    <ToolFrame
      title="Markdown Preview"
      tagline="Write Markdown and see the rendered result live, with the HTML available to copy."
    >
      <Note kind="info">
        Output is sanitised with DOMPurify before it is displayed, so inline HTML in your Markdown
        cannot execute scripts.
      </Note>

      <div className="dt-row">
        <Checkbox label="Line breaks become <br>" checked={breaks} onChange={setBreaks} />
        <Checkbox label="Show HTML source" checked={showHtml} onChange={setShowHtml} />
        <Button variant="quiet" onClick={() => setSource(SAMPLE)}>
          Load sample
        </Button>
        <Button variant="quiet" onClick={() => setSource("")} disabled={!source}>
          Clear
        </Button>
      </div>

      <div className="dt-split">
        <Panel title="Markdown">
          <TextArea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="# Start typing…"
            softWrap
            style={{ minHeight: "26rem" }}
            aria-label="Markdown source"
          />
        </Panel>

        <Panel
          title={showHtml ? "HTML source" : "Preview"}
          flush
          actions={
            <>
              <CopyButton value={html} label="Copy HTML" />
              <DownloadButton data={html} filename="preview.html" mime="text/html" />
            </>
          }
        >
          {showHtml ? (
            <pre className="dt-code" style={{ minHeight: "26rem", maxHeight: "34rem", overflow: "auto", whiteSpace: "pre-wrap" }}>
              {html}
            </pre>
          ) : (
            <div
              ref={previewRef}
              className="dt-prose"
              style={{ minHeight: "26rem", maxHeight: "34rem", overflowY: "auto" }}
              // Safe: renderMarkdown returns DOMPurify-sanitised HTML and there
              // is no code path in tools-core that returns it unsanitised.
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </Panel>
      </div>

      <StatRow
        items={[
          { label: "Words", value: stats.words.toLocaleString() },
          { label: "Characters", value: stats.characters.toLocaleString() },
          { label: "Lines", value: stats.lines.toLocaleString() },
          { label: "Reading time", value: `${stats.readingMinutes} min` },
        ]}
      />
    </ToolFrame>
  );
}
