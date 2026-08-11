import { lazy, Suspense, type ComponentType } from "react";
import { Spinner } from "@devtools/ui";

/**
 * The pdf-tools remote's single public export.
 *
 * Several slugs resolve to the same module because the tools are genuinely the
 * same screen with a different output step — extracting to .txt and to .docx
 * share their whole pipeline, as do the two Word conversions.
 */

const TOOLS: Record<string, ComponentType> = {
  "merge-pdf": lazy(() => import("../tools/MergePdf.js")),
  "split-pdf": lazy(() => import("../tools/SplitPdf.js")),
  "remove-pdf-pages": lazy(() =>
    import("../tools/PageSelector.js").then((m) => ({ default: m.RemovePdfPages })),
  ),
  "rotate-pdf": lazy(() =>
    import("../tools/PageSelector.js").then((m) => ({ default: m.RotatePdf })),
  ),
  "images-to-pdf": lazy(() => import("../tools/ImagesToPdf.js")),
  "pdf-to-images": lazy(() => import("../tools/PdfToImages.js")),
  "pdf-to-text": lazy(() =>
    import("../tools/PdfToText.js").then((m) => ({ default: m.PdfToText })),
  ),
  "pdf-to-word": lazy(() =>
    import("../tools/PdfToText.js").then((m) => ({ default: m.PdfToWord })),
  ),
  "word-to-pdf": lazy(() =>
    import("../tools/WordTools.js").then((m) => ({ default: m.WordToPdf })),
  ),
  "word-to-html": lazy(() =>
    import("../tools/WordTools.js").then((m) => ({ default: m.WordToHtml })),
  ),
  "compress-pdf": lazy(() => import("../tools/CompressPdf.js")),
  "unlock-pdf": lazy(() => import("../tools/UnlockPdf.js")),
  "edit-pdf": lazy(() => import("../tools/EditPdf.js")),
  "watermark-pdf": lazy(() => import("../tools/WatermarkPdf.js")),
  "page-numbers-pdf": lazy(() => import("../tools/PageNumbersPdf.js")),
  "header-footer-pdf": lazy(() => import("../tools/HeaderFooterPdf.js")),
  "bates-numbering-pdf": lazy(() => import("../tools/BatesNumberingPdf.js")),
  "crop-pdf": lazy(() => import("../tools/CropPdf.js")),
  "resize-pdf": lazy(() => import("../tools/ResizePdf.js")),
  "flip-pdf": lazy(() => import("../tools/FlipPdf.js")),
  "grayscale-pdf": lazy(() => import("../tools/GrayscalePdf.js")),
  "extract-pdf-images": lazy(() => import("../tools/ExtractImagesPdf.js")),
  "edit-pdf-metadata": lazy(() => import("../tools/EditMetadataPdf.js")),
  "remove-pdf-annotations": lazy(() => import("../tools/RemoveAnnotationsPdf.js")),
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
          The pdf-tools remote has no tool registered for <code>{slug}</code>.
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
