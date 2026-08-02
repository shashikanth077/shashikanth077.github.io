import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

/**
 * Cached FFmpeg instance loader.
 *
 * A single instance is reused across conversions. Cancel calls terminate() and
 * reset the cache so the next run rebuilds cleanly.
 *
 * Why a CDN core: the ffmpeg-core JS + WASM together are ~30 MB. Bundling them
 * would balloon the shipped artifact for every visitor whether or not they
 * open this tool. Fetching from unpkg on first use keeps the initial payload
 * small; toBlobURL rehosts them as same-origin blob URLs so the Worker script
 * inside ffmpeg-core can importScripts them without CORS issues.
 *
 * Privacy is unchanged: the CDN request is for public code, not user data —
 * videos are only ever read into WebAssembly memory in the same tab.
 */

const CORE_URL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

let instance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

export interface LoadFFmpegOptions {
  onProgress?: (percent: number) => void;
  onLog?: (message: string) => void;
}

export async function loadFFmpeg(options: LoadFFmpegOptions = {}): Promise<FFmpeg> {
  if (instance) return instance;
  if (loadPromise) return loadPromise;

  const { onProgress, onLog } = options;

  loadPromise = (async () => {
    const ffmpeg = new FFmpeg();

    if (onLog) ffmpeg.on("log", ({ message }) => onLog(message));

    // Rough milestone-only progress — the two toBlobURL steps are the slow
    // part; ffmpeg.load itself is milliseconds once the URLs exist.
    onProgress?.(5);
    const coreURL = await toBlobURL(`${CORE_URL}/ffmpeg-core.js`, "text/javascript");
    onProgress?.(45);
    const wasmURL = await toBlobURL(`${CORE_URL}/ffmpeg-core.wasm`, "application/wasm");
    onProgress?.(90);
    await ffmpeg.load({ coreURL, wasmURL });
    onProgress?.(100);

    instance = ffmpeg;
    return ffmpeg;
  })();

  try {
    return await loadPromise;
  } catch (err) {
    loadPromise = null;
    throw err;
  }
}

/** Kills the worker and clears the cache. Next call to loadFFmpeg starts fresh. */
export function resetFFmpeg(): void {
  if (instance) {
    try {
      instance.terminate();
    } catch {
      /* worker already gone — ignore */
    }
  }
  instance = null;
  loadPromise = null;
}

export function hasFFmpegLoaded(): boolean {
  return instance !== null;
}
