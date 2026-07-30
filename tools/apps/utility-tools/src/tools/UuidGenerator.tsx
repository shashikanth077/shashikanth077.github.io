import { useCallback, useEffect, useState } from "react";
import { generateUuids, MAX_UUID_COUNT, type UuidFormat } from "@devtools/tools-core";
import {
  Button,
  Checkbox,
  CopyButton,
  DownloadButton,
  Field,
  Panel,
  StatRow,
  TextInput,
  ToolFrame,
} from "@devtools/ui";

export default function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState<UuidFormat>({});
  const [uuids, setUuids] = useState<string[]>([]);

  const generate = useCallback(() => {
    setUuids(generateUuids(count, format));
  }, [count, format]);

  // Generate once on mount and whenever the format changes, so the panel is
  // never empty and toggles show their effect immediately.
  useEffect(() => {
    setUuids(generateUuids(count, format));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format]);

  const joined = uuids.join("\n");

  return (
    <ToolFrame
      title="UUID Generator"
      tagline="Generate RFC 4122 version 4 UUIDs using your browser's cryptographic random source."
    >
      <div className="dt-split dt-split--wide-right">
        <Panel title="Options">
          <div className="dt-stack">
            <Field label="How many" hint={`1 to ${MAX_UUID_COUNT.toLocaleString()}`}>
              {(id) => (
                <TextInput
                  id={id}
                  type="number"
                  min={1}
                  max={MAX_UUID_COUNT}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                />
              )}
            </Field>

            <Checkbox
              label="Uppercase"
              checked={Boolean(format.uppercase)}
              onChange={(uppercase) => setFormat((f) => ({ ...f, uppercase }))}
            />
            <Checkbox
              label="Wrap in braces {…}"
              checked={Boolean(format.braces)}
              onChange={(braces) => setFormat((f) => ({ ...f, braces }))}
            />
            <Checkbox
              label="Remove hyphens"
              checked={Boolean(format.compact)}
              onChange={(compact) => setFormat((f) => ({ ...f, compact }))}
            />

            <Button variant="primary" onClick={generate}>
              Generate
            </Button>
          </div>
        </Panel>

        <Panel
          title={`Output — ${uuids.length} UUID${uuids.length === 1 ? "" : "s"}`}
          flush
          actions={
            <>
              <CopyButton value={joined} label="Copy all" />
              <DownloadButton data={joined} filename="uuids.txt" />
            </>
          }
        >
          <pre className="dt-code" style={{ maxHeight: "28rem", overflowY: "auto" }}>
            {joined}
          </pre>
        </Panel>
      </div>

      <StatRow
        items={[
          { label: "Version", value: "4 (random)" },
          { label: "Source", value: "crypto.randomUUID" },
          { label: "Bits of entropy", value: 122 },
        ]}
      />
    </ToolFrame>
  );
}
