/**
 * Canvas-based image processing.
 *
 * No dependencies — the browser already has a competent image codec. Format
 * support is whatever the browser encodes, which today means PNG, JPEG and
 * WebP everywhere, and AVIF encoding only in some browsers (see canEncode).
 */

export type ImageFormat = "image/png" | "image/jpeg" | "image/webp" | "image/avif";

export const FORMAT_LABELS: Record<ImageFormat, string> = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WebP",
  "image/avif": "AVIF",
};

export const FORMAT_EXTENSIONS: Record<ImageFormat, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** Formats without an alpha channel — a transparent source needs a matte. */
const OPAQUE_FORMATS = new Set<ImageFormat>(["image/jpeg"]);

/**
 * Feature-detects encoder support. toBlob silently falls back to PNG for a
 * format it cannot encode, so without this check an "AVIF" download would
 * quietly be a PNG with the wrong extension.
 */
export async function canEncode(format: ImageFormat): Promise<boolean> {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format, 0.5));
  return blob?.type === format;
}

export interface LoadedImage {
  bitmap: ImageBitmap;
  width: number;
  height: number;
}

export async function loadImage(file: Blob): Promise<LoadedImage> {
  try {
    const bitmap = await createImageBitmap(file);
    return { bitmap, width: bitmap.width, height: bitmap.height };
  } catch {
    throw new Error("That file could not be decoded as an image.");
  }
}

export interface ResizeSpec {
  width?: number;
  height?: number;
  /** Never scale past the original — upscaling only adds bytes, not detail. */
  allowUpscale?: boolean;
}

/** Resolves a partial width/height into concrete dimensions, preserving aspect. */
export function resolveDimensions(
  source: { width: number; height: number },
  spec: ResizeSpec,
): { width: number; height: number } {
  const { allowUpscale = false } = spec;
  const ratio = source.width / source.height;

  let width = spec.width ?? 0;
  let height = spec.height ?? 0;

  if (width && !height) height = Math.round(width / ratio);
  else if (height && !width) width = Math.round(height * ratio);
  else if (!width && !height) return { width: source.width, height: source.height };

  if (!allowUpscale && (width > source.width || height > source.height)) {
    return { width: source.width, height: source.height };
  }

  return { width: Math.max(1, Math.round(width)), height: Math.max(1, Math.round(height)) };
}

export type Rotation = 0 | 90 | 180 | 270;

export interface ProcessOptions {
  format?: ImageFormat;
  quality?: number;
  resize?: ResizeSpec;
  rotate?: Rotation;
  flipH?: boolean;
  flipV?: boolean;
  /** Backdrop when flattening transparency into an opaque format. */
  matte?: string;
}

export interface ProcessResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  format: ImageFormat;
}

export async function processImage(file: Blob, options: ProcessOptions = {}): Promise<ProcessResult> {
  const {
    format = "image/png",
    quality = 0.85,
    resize = {},
    rotate = 0,
    flipH = false,
    flipV = false,
    matte = "#ffffff",
  } = options;

  const source = await loadImage(file);
  const target = resolveDimensions(source, resize);

  // A quarter turn swaps the canvas axes.
  const swap = rotate === 90 || rotate === 270;
  const canvas = document.createElement("canvas");
  canvas.width = swap ? target.height : target.width;
  canvas.height = swap ? target.width : target.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get a 2D canvas context.");

  if (OPAQUE_FORMATS.has(format)) {
    ctx.fillStyle = matte;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (rotate) ctx.rotate((rotate * Math.PI) / 180);
  if (flipH || flipV) ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(source.bitmap, -target.width / 2, -target.height / 2, target.width, target.height);

  source.bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, format, quality),
  );
  if (!blob) throw new Error("The image could not be encoded.");

  const result: ProcessResult = {
    blob,
    url: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
    format,
  };

  canvas.width = 0;
  canvas.height = 0;
  return result;
}

/**
 * Binary-searches JPEG/WebP quality to land under a byte budget.
 *
 * Quality→size is monotonic but not linear, so a fixed guess either overshoots
 * the target or throws away far more detail than needed.
 */
export async function compressToTarget(
  file: Blob,
  targetBytes: number,
  format: ImageFormat = "image/jpeg",
  maxAttempts = 7,
): Promise<ProcessResult & { quality: number; attempts: number }> {
  if (format === "image/png") {
    throw new Error("PNG is lossless — use JPEG or WebP to hit a size target.");
  }

  let low = 0.05;
  let high = 0.95;
  let best: ProcessResult | null = null;
  let bestQuality = high;
  let attempts = 0;

  for (let i = 0; i < maxAttempts; i++) {
    attempts++;
    const quality = (low + high) / 2;
    const result = await processImage(file, { format, quality });

    if (result.blob.size <= targetBytes) {
      if (best) URL.revokeObjectURL(best.url);
      best = result;
      bestQuality = quality;
      low = quality; // room to spend on more quality
    } else {
      URL.revokeObjectURL(result.url);
      high = quality;
    }
  }

  if (!best) {
    // Even the floor quality missed the budget — return it anyway and let the
    // UI report the shortfall rather than failing outright.
    best = await processImage(file, { format, quality: 0.05 });
    bestQuality = 0.05;
  }

  return { ...best, quality: bestQuality, attempts };
}

/** Transcodes anything the browser can decode into PNG bytes, for pdf-lib. */
export async function imageToPngBytes(file: Blob): Promise<ArrayBuffer> {
  const result = await processImage(file, { format: "image/png" });
  const bytes = await result.blob.arrayBuffer();
  URL.revokeObjectURL(result.url);
  return bytes;
}
