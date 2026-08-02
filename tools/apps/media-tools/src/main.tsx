/** Standalone development entry — see the note in utility-tools/src/main.tsx. */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ToolRoutes from "./expose/ToolRoutes.js";

import "@devtools/ui/tokens.css";
import "@devtools/ui/components.css";
import "@devtools/ui/files.css";

function StandaloneHarness() {
  return (
    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.6rem 0.85rem",
          background: "var(--warning-soft)",
          color: "var(--warning)",
          border: "1px solid var(--warning)",
          borderRadius: "var(--radius-sm)",
          fontSize: "0.8125rem",
        }}
      >
        <strong>Standalone mode</strong>
        <span>media-tools running outside the shell.</span>
      </div>

      <ToolRoutes slug="video-to-audio" />
    </div>
  );
}

const container = document.getElementById("root");
if (!container) throw new Error("#root is missing from index.html");

createRoot(container).render(
  <StrictMode>
    <StandaloneHarness />
  </StrictMode>,
);
