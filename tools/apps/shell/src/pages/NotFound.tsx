import { Link } from "react-router-dom";
import { ROUTER_HOME } from "@devtools/tools-core";

export default function NotFound() {
  return (
    <div style={{ maxWidth: "40rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 650 }}>No such tool</h1>
      <p style={{ color: "var(--text-soft)" }}>
        That address doesn&rsquo;t match any tool on the platform. It may have been renamed, or the
        link may be incomplete.
      </p>
      <Link to={ROUTER_HOME} className="dt-btn dt-btn--primary" style={{ alignSelf: "flex-start", textDecoration: "none" }}>
        Browse all tools
      </Link>
    </div>
  );
}
