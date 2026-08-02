import { lazy, Suspense, type ComponentType } from "react";
import { Spinner } from "@devtools/ui";

/** The media-tools remote's single public export. */

const TOOLS: Record<string, ComponentType> = {
  "video-to-audio": lazy(() =>
    import("../VideoToAudio.js").then((m) => ({ default: m.VideoToAudio })),
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
          The media-tools remote has no tool registered for <code>{slug}</code>.
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
