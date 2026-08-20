/**
 * Standalone development entry.
 *
 * Only used when this remote runs on its own port (`npm run dev:remote`). In
 * production the shell loads ./expose/ToolRoutes directly and this file is
 * never evaluated — but keeping the remote independently runnable is what makes
 * it a genuine micro-frontend rather than a glorified lazy import.
 */

import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { toolRoutes } from "@devtools/tools-core";
import ToolRoutes from "./expose/ToolRoutes.js";

import "@devtools/ui/tokens.css";
import "@devtools/ui/components.css";

function StandaloneHarness() {
  const [slug, setSlug] = useState(toolRoutes[0]?.slug ?? "jwt-decoder");

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
          border: "1px solid var(--warning-soft)",
          borderRadius: "var(--radius-sm)",
          fontSize: "0.8125rem",
        }}
      >
        <strong>Standalone mode</strong>
        <span>utility-tools running outside the shell — no nav, no theme switching.</span>
        <select
          className="dt-select"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          style={{ width: "auto", marginLeft: "auto" }}
          aria-label="Select tool"
        >
          {toolRoutes
            .filter((route) => route.remote === "utility")
            .map((route) => (
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
