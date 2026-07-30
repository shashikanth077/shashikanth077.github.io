/** Standalone development entry — see the note in utility-tools/src/main.tsx. */

import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { toolRoutes } from "@devtools/tools-core";
import ToolRoutes from "./expose/ToolRoutes.js";

import "@devtools/ui/tokens.css";
import "@devtools/ui/components.css";
import "@devtools/ui/files.css";

function StandaloneHarness() {
  const own = toolRoutes.filter((r) => r.remote === "pdf");
  const [slug, setSlug] = useState(own[0]?.slug ?? "merge-pdf");

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
          border: "1px solid color-mix(in srgb, var(--warning) 25%, transparent)",
          borderRadius: "var(--radius-sm)",
          fontSize: "0.8125rem",
        }}
      >
        <strong>Standalone mode</strong>
        <span>pdf-tools running outside the shell.</span>
        <select
          className="dt-select"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          style={{ width: "auto", marginLeft: "auto" }}
          aria-label="Select tool"
        >
          {own.map((route) => (
            <option key={route.slug} value={route.slug}>
              {route.name}
            </option>
          ))}
        </select>
      </div>

      <ToolRoutes slug={slug} />
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
