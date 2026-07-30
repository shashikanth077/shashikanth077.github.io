/**
 * Serves ../out the way GitHub Pages does, for verifying a production build
 * locally before pushing.
 *
 * Mirrors Pages behaviour that a dev server does NOT: no SPA fallback, no
 * rewrites. A path only resolves if a real file or a directory index.html
 * exists — which is exactly the condition the prerender step exists to satisfy.
 *
 *   node tools/scripts/serve-static.mjs
 */

import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, "../../out");
const PORT = Number(process.env["PORT"] ?? 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

async function resolveFile(urlPath) {
  // Block traversal outside ROOT.
  const safe = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, "");
  const candidate = join(ROOT, safe);
  if (!candidate.startsWith(ROOT)) return null;

  try {
    const info = await stat(candidate);
    if (info.isDirectory()) {
      const index = join(candidate, "index.html");
      await stat(index);
      return index;
    }
    return candidate;
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  const urlPath = (req.url ?? "/").split("?")[0] ?? "/";
  let file = await resolveFile(urlPath);
  let status = 200;

  if (!file) {
    // Exactly what Pages does: fall back to /404.html, still a 404.
    file = await resolveFile("/404.html");
    status = 404;
  }

  if (!file) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("404");
    console.log(`  404  ${urlPath}`);
    return;
  }

  res.writeHead(status, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
  console.log(`  ${status}  ${urlPath}`);
});

server.listen(PORT, () => {
  console.log(`\n  Serving ${ROOT}`);
  console.log(`  http://localhost:${PORT}/tools/\n`);
});
