/**
 * Assembles the static output for GitHub Pages.
 *
 *   apps/shell/dist          → out/tools/
 *   apps/utility-tools/dist  → out/tools/utility-tools/
 *   then one prerendered index.html per tool route
 *   then tool URLs merged into out/sitemap.xml
 *
 * Why prerender at all: GitHub Pages has no rewrite rules, so a direct request
 * for /tools/jwt-decoder would 404 — there is no file there. Writing a real
 * index.html into each route directory fixes that AND gives crawlers correct
 * per-tool metadata on first byte, which the 404-redirect trick cannot do.
 *
 * Route data comes from routes.json, emitted by the shell's Vite build from
 * libs/tools-core/src/routes.ts. Node cannot import the TypeScript manifest
 * directly, and duplicating it here would let the two drift apart.
 */

import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const toolsRoot = resolve(here, "..");
const repoRoot = resolve(toolsRoot, "..");

const SHELL_DIST = join(toolsRoot, "apps/shell/dist");

/** Each remote is copied to out/tools/<dir>/, matching the entry URLs in the shell's config. */
const REMOTES = [
  { dir: "utility-tools", dist: join(toolsRoot, "apps/utility-tools/dist") },
  { dir: "pdf-tools", dist: join(toolsRoot, "apps/pdf-tools/dist") },
  { dir: "image-tools", dist: join(toolsRoot, "apps/image-tools/dist") },
  { dir: "media-tools", dist: join(toolsRoot, "apps/media-tools/dist") },
];
const OUT_ROOT = join(repoRoot, "out");
const OUT_TOOLS = join(OUT_ROOT, "tools");
const SITEMAP = join(OUT_ROOT, "sitemap.xml");

const SITE_ORIGIN = "https://shashikant-hr.me";

/* ------------------------------------------------------------------ */

function fail(message) {
  console.error(`\n  postbuild: ${message}\n`);
  process.exit(1);
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Replaces a whole tag matched by `pattern`, or appends before </head>. */
function upsert(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace("</head>", `    ${replacement}\n  </head>`);
}

export function buildToolHtml(baseHtml, route) {
  const title = `${route.name} — Free Online Tool`;
  const canonical = `${SITE_ORIGIN}/tools/${route.slug}`;
  const description = route.description;

  let html = baseHtml;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(title)}</title>`);
  html = upsert(
    html,
    /<meta\s+name="description"[\s\S]*?\/?>/,
    `<meta name="description" content="${escapeAttr(description)}" />`,
  );
  html = upsert(
    html,
    /<meta\s+name="keywords"[\s\S]*?\/?>/,
    `<meta name="keywords" content="${escapeAttr(route.keywords.join(", "))}" />`,
  );
  html = upsert(html, /<link\s+rel="canonical"[\s\S]*?\/?>/, `<link rel="canonical" href="${canonical}" />`);
  html = upsert(
    html,
    /<meta\s+property="og:title"[\s\S]*?\/?>/,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
  );
  html = upsert(
    html,
    /<meta\s+property="og:description"[\s\S]*?\/?>/,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
  );
  html = upsert(html, /<meta\s+property="og:url"[\s\S]*?\/?>/, `<meta property="og:url" content="${canonical}" />`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: route.name,
    description,
    url: canonical,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any (runs in the browser)",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    keywords: route.keywords.join(", "),
    author: { "@type": "Person", name: "Shashikanth Hosur Ramegowda", url: SITE_ORIGIN },
  };

  // `</script>` inside a script body would close it early.
  const serialised = JSON.stringify(jsonLd, null, 2).replace(/<\//g, "<\\/");
  html = html.replace(
    "</head>",
    `    <script type="application/ld+json">\n${serialised}\n    </script>\n  </head>`,
  );

  return html;
}

export function buildResourceHtml(baseHtml, stack) {
  const title = stack
    ? `${stack.name} Learning Portal — Concepts & Interview Prep | ToolNest`
    : "Learning Portal — Concepts & Interview Prep by Tech Stack | ToolNest";
  const description = stack
    ? `${stack.name} learning portal: ${stack.blurb}`
    : "Pick a tech stack and learn it properly: concept library with production and interview angles, drills, code labs, question bank and mock interviews.";
  const canonical = `${SITE_ORIGIN}/tools/resources${stack ? `/${stack.slug}` : ""}`;
  let html = baseHtml.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(title)}</title>`);
  html = upsert(html, /<meta\s+name="description"[\s\S]*?\/?>/, `<meta name="description" content="${escapeAttr(description)}" />`);
  html = upsert(html, /<link\s+rel="canonical"[\s\S]*?\/?>/, `<link rel="canonical" href="${canonical}" />`);
  html = upsert(html, /<meta\s+property="og:title"[\s\S]*?\/?>/, `<meta property="og:title" content="${escapeAttr(title)}" />`);
  html = upsert(html, /<meta\s+property="og:description"[\s\S]*?\/?>/, `<meta property="og:description" content="${escapeAttr(description)}" />`);
  html = upsert(html, /<meta\s+property="og:url"[\s\S]*?\/?>/, `<meta property="og:url" content="${canonical}" />`);
  return html;
}

async function mergeSitemap(routes, stacks) {
  if (!existsSync(SITEMAP)) {
    console.warn("  · out/sitemap.xml not found — skipping sitemap merge.");
    return;
  }

  const xml = await readFile(SITEMAP, "utf8");
  const urls = [`${SITE_ORIGIN}/tools/`, `${SITE_ORIGIN}/tools/resources`, ...stacks.map((s) => `${SITE_ORIGIN}/tools/resources/${s.slug}`), ...routes.map((r) => `${SITE_ORIGIN}/tools/${r.slug}`)];
  const allowed = new Set(urls);
  // Remove stale tool URLs (including retired tools) without touching portfolio entries.
  const cleaned = xml.replace(/<url>[\s\S]*?<\/url>/g, (entry) => {
    const loc = /<loc>([^<]+)<\/loc>/.exec(entry)?.[1];
    return loc?.startsWith(`${SITE_ORIGIN}/tools/`) && !allowed.has(loc) ? "" : entry;
  });
  const missing = urls.filter((url) => !cleaned.includes(`<loc>${url}</loc>`));
  const entries = missing.map((url) =>
    `  <url>\n    <loc>${url}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${url.endsWith("/tools/") ? "0.9" : "0.8"}</priority>\n  </url>`,
  ).join("\n");
  await writeFile(SITEMAP, cleaned.replace("</urlset>", `${entries}\n</urlset>`), "utf8");
  console.log(`  · sitemap.xml: synced ${urls.length} ToolNest URLs`);
}

/* ------------------------------------------------------------------ */

async function main() {
  if (!existsSync(SHELL_DIST)) fail(`shell build missing at ${SHELL_DIST} — run "npm run build:shell" first.`);
  for (const remote of REMOTES) {
    if (!existsSync(remote.dist)) {
      fail(`remote build missing at ${remote.dist} — run "npm run build:remotes" first.`);
    }
  }
  if (!existsSync(OUT_ROOT)) {
    fail(
      `out/ does not exist. The portfolio must build first — run "npm run export" at the repo root, ` +
        `then this script. (next export rewrites out/ wholesale and would wipe out/tools.)`,
    );
  }

  const routesFile = join(SHELL_DIST, "routes.json");
  if (!existsSync(routesFile)) fail(`${routesFile} missing — the shell's emit-routes plugin did not run.`);
  const allRoutes = JSON.parse(await readFile(routesFile, "utf8"));
  if (!Array.isArray(allRoutes) || allRoutes.length === 0) fail("routes.json is empty.");
  // Hidden routes get no prerendered page and no sitemap entry — they exist for
  // dev-only client-side access and never touch production SEO surfaces.
  const routes = allRoutes.filter((r) => !r.hidden);
  const hiddenCount = allRoutes.length - routes.length;

  console.log("\n  Assembling out/tools …");

  await rm(OUT_TOOLS, { recursive: true, force: true });
  await mkdir(OUT_TOOLS, { recursive: true });

  await cp(SHELL_DIST, OUT_TOOLS, { recursive: true });
  for (const remote of REMOTES) {
    await cp(remote.dist, join(OUT_TOOLS, remote.dir), { recursive: true });
  }
  console.log(`  · copied shell + ${REMOTES.length} remotes`);

  // routes.json is a build artefact, not something to serve.
  await rm(join(OUT_TOOLS, "routes.json"), { force: true });
  await rm(join(OUT_TOOLS, "stacks.json"), { force: true });

  const baseHtml = await readFile(join(OUT_TOOLS, "index.html"), "utf8");

  for (const route of routes) {
    const dir = join(OUT_TOOLS, route.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "index.html"), buildToolHtml(baseHtml, route), "utf8");
  }
  const resourcesDir = join(OUT_TOOLS, "resources");
  await mkdir(resourcesDir, { recursive: true });
  await writeFile(join(resourcesDir, "index.html"), buildResourceHtml(baseHtml), "utf8");

  // One prerendered page per live learning stack (GitHub Pages has no SPA fallback).
  const stacksFile = join(SHELL_DIST, "stacks.json");
  if (!existsSync(stacksFile)) fail(`${stacksFile} missing — the shell's emit-stacks plugin did not run.`);
  const stacks = JSON.parse(await readFile(stacksFile, "utf8"));
  for (const stack of stacks) {
    const dir = join(resourcesDir, stack.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "index.html"), buildResourceHtml(baseHtml, stack), "utf8");
  }
  console.log(
    `  · prerendered ${routes.length} tool pages` +
      (hiddenCount > 0 ? ` (${hiddenCount} hidden route${hiddenCount === 1 ? "" : "s"} skipped)` : ""),
  );

  await mergeSitemap(routes, stacks);

  const top = (await readdir(OUT_TOOLS)).filter((n) => !n.startsWith("."));
  console.log(`  · out/tools contains ${top.length} entries\n`);
}

// Only run when invoked directly, so the helpers above stay importable by tests.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => fail(error instanceof Error ? error.stack ?? error.message : String(error)));
}
