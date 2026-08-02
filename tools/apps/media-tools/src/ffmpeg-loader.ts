import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
// Raw source of @ffmpeg/ffmpeg's own worker glue, read at build time via
// Vite's `?raw` suffix through the package's public "./worker" export — see
// buildClassWorkerBlobURL() below for why this exists instead of letting the
// library resolve its own worker URL.
import ffmpegWorkerSrc from "@ffmpeg/ffmpeg/worker?raw";

/**
 * Cached FFmpeg instance loader.
 *
 * A single instance is reused across conversions. Cancel calls terminate() and
 * reset the cache so the next run rebuilds cleanly.
 *
 * Why a CDN core: the ffmpeg-core JS + WASM together are ~30 MB. Bundling them
 * would balloon the shipped artifact for every visitor whether or not they
 * open this tool. Fetching from unpkg on first use keeps the initial payload
 * small; toBlobURL rehosts them as blob URLs (same-origin as this page,
 * regardless of where the bytes came from) so the worker can import them
 * without hitting the browser's worker cross-origin restriction.
 *
 * The core build MUST be the ESM variant, not UMD: @ffmpeg/ffmpeg's worker
 * runs as `type: "module"` and falls back to a dynamic `import()` of the core
 * script when `importScripts` is unavailable (which is always, inside a
 * module worker). Importing a UMD bundle as an ES module yields no `default`
 * export, which is exactly the library's "failed to import ffmpeg-core.js"
 * error.
 *
 * Privacy is unchanged: the CDN request is for public code, not user data —
 * videos are only ever read into WebAssembly memory in the same tab.
 */

const CORE_URL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";

let instance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;
let workerBlobURL: string | null = null;

/**
 * @ffmpeg/ffmpeg's own class worker (classes.js) resolves its worker script
 * with `new URL("./worker.js", import.meta.url)`. When this app is loaded as
 * a Module Federation remote — served from its own dev port, or assembled
 * under a different path than the host — that URL's origin can differ from
 * the page that's constructing the Worker, and browsers refuse to construct
 * a dedicated Worker from a cross-origin script URL outright (no CORS header
 * makes this allowed; only same-origin or blob:/data: URLs are).
 *
 * The fix used everywhere else in this loader (toBlobURL) doesn't apply
 * directly here, because worker.js itself has two relative ESM imports
 * (./const.js, ./errors.js) that a blob: URL can't resolve — a blob URL has
 * no path for "relative" to mean anything, so a multi-file ESM graph can't
 * be shipped through one. Those two sibling files also aren't part of the
 * package's public `exports` map (only "." and "./worker" are), so they
 * can't be imported directly either.
 *
 * Fix: pull in worker.js itself through the package's own public "./worker"
 * subpath (via Vite's `?raw`, so it always matches whatever version of
 * @ffmpeg/ffmpeg is actually installed), strip its two import lines, and
 * prepend the handful of constants those two files provide — the message
 * protocol between this worker and FFmpeg's main-thread class, which is
 * necessarily stable within a given package version since both sides ship
 * from the same installed copy. The result has no external references, so it
 * can be blobbed and loaded as a worker regardless of origin.
 */
const FFMPEG_CORE_URL = "https://unpkg.com/@ffmpeg/core@0.12.9/dist/umd/ffmpeg-core.js";
const FF_MESSAGE_TYPE = {
  LOAD: "LOAD",
  EXEC: "EXEC",
  FFPROBE: "FFPROBE",
  WRITE_FILE: "WRITE_FILE",
  READ_FILE: "READ_FILE",
  DELETE_FILE: "DELETE_FILE",
  RENAME: "RENAME",
  CREATE_DIR: "CREATE_DIR",
  LIST_DIR: "LIST_DIR",
  DELETE_DIR: "DELETE_DIR",
  ERROR: "ERROR",
  DOWNLOAD: "DOWNLOAD",
  PROGRESS: "PROGRESS",
  LOG: "LOG",
  MOUNT: "MOUNT",
  UNMOUNT: "UNMOUNT",
};

function buildClassWorkerBlobURL(): string {
  if (workerBlobURL) return workerBlobURL;

  const workerBody = ffmpegWorkerSrc.replace(/^import\s[^\n]*;\s*$/gm, "");
  const prelude = [
    `const CORE_URL = ${JSON.stringify(FFMPEG_CORE_URL)};`,
    `const FFMessageType = ${JSON.stringify(FF_MESSAGE_TYPE)};`,
    `const ERROR_UNKNOWN_MESSAGE_TYPE = new Error("unknown message type");`,
    `const ERROR_NOT_LOADED = new Error("ffmpeg is not loaded, call \`await ffmpeg.load()\` first");`,
    `const ERROR_IMPORT_FAILURE = new Error("failed to import ffmpeg-core.js");`,
  ].join("\n");

  const blob = new Blob([`${prelude}\n${workerBody}`], { type: "text/javascript" });
  workerBlobURL = URL.createObjectURL(blob);
  return workerBlobURL;
}

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
    await ffmpeg.load({ coreURL, wasmURL, classWorkerURL: buildClassWorkerBlobURL() });
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
