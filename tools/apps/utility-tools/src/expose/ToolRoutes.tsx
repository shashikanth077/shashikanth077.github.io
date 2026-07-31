import { lazy, Suspense, type ComponentType } from "react";
import { Spinner } from "@devtools/ui";

/**
 * The remote's single public export — the only thing the shell may import.
 *
 * The shell owns routing and passes a slug; this module owns the mapping from
 * slug to implementation. That split means adding a tool here never requires a
 * shell change, which is the whole point of the remote being separate.
 *
 * Each tool is lazily imported so the remote splits into per-tool chunks rather
 * than shipping all nine on first load.
 */

const TOOLS: Record<string, ComponentType> = {
  "jwt-decoder": lazy(() => import("../tools/JwtDecoder.js")),
  "uuid-generator": lazy(() => import("../tools/UuidGenerator.js")),
  "base64-encoder": lazy(() => import("../tools/Base64Tool.js")),
  "url-encoder": lazy(() => import("../tools/UrlTool.js")),
  "json-formatter": lazy(() => import("../tools/JsonFormatter.js")),
  "json-validator": lazy(() => import("../tools/JsonValidator.js")),
  "markdown-preview": lazy(() => import("../tools/MarkdownPreview.js")),
  "qr-code-generator": lazy(() => import("../tools/QrGenerator.js")),
  "barcode-generator": lazy(() => import("../tools/BarcodeGenerator.js")),
  "css-beautifier": lazy(() => import("../tools/CssBeautifier.js")),
  "js-beautifier": lazy(() => import("../tools/JsBeautifier.js")),
  "diff-checker": lazy(() => import("../tools/DiffChecker.js")),
};

/** Lets the shell check ownership before it bothers mounting the remote. */
export function ownsSlug(slug: string): boolean {
  return slug in TOOLS;
}

export interface ToolRoutesProps {
  slug: string;
}

export default function ToolRoutes({ slug }: ToolRoutesProps) {
  const Tool = TOOLS[slug];

  if (!Tool) {
    return (
      <div className="dt-note dt-note--error" role="alert">
        <div className="dt-note__body">
          The utility-tools remote has no tool registered for <code>{slug}</code>. This usually
          means the route manifest and the remote have drifted apart.
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<Spinner />}>
      <Tool />
    </Suspense>
  );
}
