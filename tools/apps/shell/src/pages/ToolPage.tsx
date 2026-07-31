import { lazy, Suspense, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { findTool, SITE_ORIGIN, toolPath, type RemoteName } from "@devtools/tools-core";
import { Spinner } from "@devtools/ui";
import { ErrorBoundary } from "../components/ErrorBoundary.js";
import { recordVisit, type AppDispatch } from "../store.js";
import NotFound from "./NotFound.js";

/**
 * The federated imports, resolved at runtime from the URLs configured in
 * vite.config.ts — so shipping a new version of any remote needs no shell
 * rebuild. Only the remote a route actually names is ever fetched.
 */
const REMOTES: Record<RemoteName, ReturnType<typeof lazy>> = {
  utility: lazy(() => import("utility_tools/ToolRoutes")),
  pdf: lazy(() => import("pdf_tools/ToolRoutes")),
  image: lazy(() => import("image_tools/ToolRoutes")),
};

/**
 * Keeps the document head in sync on client-side navigation.
 *
 * The prerendered HTML already carries correct metadata for the initial load —
 * which is what crawlers see — but a SPA navigation would otherwise leave the
 * previous tool's title in place for anyone sharing the URL.
 */
function useDocumentMeta(title: string, description: string, canonical: string): void {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attr: string, name: string, content: string) => {
      let node = document.head.querySelector<HTMLMetaElement>(selector);
      if (!node) {
        node = document.createElement("meta");
        node.setAttribute(attr, name);
        document.head.appendChild(node);
      }
      node.setAttribute("content", content);
    };

    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:url"]', "property", "og:url", canonical);

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;
  }, [title, description, canonical]);
}

export default function ToolPage() {
  const { slug = "" } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const tool = findTool(slug);

  useEffect(() => {
    if (tool) dispatch(recordVisit(tool.slug));
  }, [dispatch, tool]);

  useDocumentMeta(
    tool ? `${tool.name} — Free Online Tool` : "Tool not found",
    tool?.description ?? "",
    tool ? `${SITE_ORIGIN}${toolPath(tool.slug)}` : SITE_ORIGIN,
  );

  if (!tool) return <NotFound />;

  const Remote = REMOTES[tool.remote] as React.ComponentType<{ slug: string }>;

  return (
    <ErrorBoundary label={tool.name} resetKey={slug}>
      <Suspense fallback={<Spinner label={`Loading ${tool.name}…`} />}>
        <Remote slug={slug} />
      </Suspense>
    </ErrorBoundary>
  );
}
