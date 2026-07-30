import { useMemo, useState } from "react";
import { decodeJwt, type DecodedJwt } from "@devtools/tools-core";
import { CopyButton, Empty, KeyValue, Note, Panel, TextArea, ToolFrame } from "@devtools/ui";

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAzNjAwfQ." +
  "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDecoder() {
  const [token, setToken] = useState("");

  const result = useMemo((): { decoded: DecodedJwt } | { error: string } | null => {
    if (!token.trim()) return null;
    try {
      return { decoded: decodeJwt(token) };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }, [token]);

  const decoded = result && "decoded" in result ? result.decoded : null;

  return (
    <ToolFrame
      title="JWT Decoder"
      tagline="Inspect a JSON Web Token's header, payload and registered claims."
    >
      <Note kind="warning">
        This decodes the token, it does not <strong>verify</strong> it. Checking a signature
        requires the issuer&rsquo;s secret or public key, and you should never paste a signing
        secret into a web page. Treat everything below as unauthenticated input.
      </Note>

      <Panel
        title="Token"
        actions={
          <>
            <button className="dt-btn dt-btn--quiet" type="button" onClick={() => setToken(SAMPLE)}>
              Load sample
            </button>
            <button
              className="dt-btn dt-btn--quiet"
              type="button"
              onClick={() => setToken("")}
              disabled={!token}
            >
              Clear
            </button>
          </>
        }
      >
        <TextArea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste a JWT — with or without the &quot;Bearer &quot; prefix"
          invalid={Boolean(result && "error" in result)}
          softWrap
          style={{ minHeight: "8rem" }}
          aria-label="JWT token input"
        />
      </Panel>

      {result && "error" in result ? <Note kind="error">{result.error}</Note> : null}

      {decoded?.warnings.length ? (
        <Note kind="warning">
          <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
            {decoded.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </Note>
      ) : null}

      {decoded ? (
        <>
          {decoded.claims.length > 0 && (
            <Panel title="Registered claims">
              <KeyValue
                rows={decoded.claims.map((claim) => ({
                  key: `${claim.label} (${claim.key})`,
                  value: claim.display,
                }))}
              />
            </Panel>
          )}

          <div className="dt-split">
            <Panel
              title="Header"
              flush
              actions={<CopyButton value={JSON.stringify(decoded.header, null, 2)} />}
            >
              <pre className="dt-code">{JSON.stringify(decoded.header, null, 2)}</pre>
            </Panel>
            <Panel
              title="Payload"
              flush
              actions={<CopyButton value={JSON.stringify(decoded.payload, null, 2)} />}
            >
              <pre className="dt-code">{JSON.stringify(decoded.payload, null, 2)}</pre>
            </Panel>
          </div>

          <Panel title="Signature" flush actions={<CopyButton value={decoded.signature} />}>
            <pre className="dt-code" style={{ wordBreak: "break-all", whiteSpace: "pre-wrap" }}>
              {decoded.signature || "(empty)"}
            </pre>
          </Panel>
        </>
      ) : (
        !result && <Empty>Paste a token above to decode it.</Empty>
      )}
    </ToolFrame>
  );
}
