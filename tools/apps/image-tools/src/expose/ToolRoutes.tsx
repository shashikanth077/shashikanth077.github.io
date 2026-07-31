import { lazy, Suspense, type ComponentType } from "react";
import { Spinner } from "@devtools/ui";

/** The image-tools remote's single public export. */

const TOOLS: Record<string, ComponentType> = {
  "image-converter": lazy(() =>
    import("../ImageTool.js").then((m) => ({ default: m.ImageConverter })),
  ),
  "image-resize": lazy(() => import("../ImageTool.js").then((m) => ({ default: m.ImageResizer }))),
  "image-compress": lazy(() =>
    import("../ImageTool.js").then((m) => ({ default: m.ImageCompressor })),
  ),
};

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
          The image-tools remote has no tool registered for <code>{slug}</code>.
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
