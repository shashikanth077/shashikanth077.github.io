/**
 * Regression test for the prerender rewrite in postbuild.mjs.
 *
 * The SEO story depends entirely on these regexes matching. If one silently
 * stops matching, the build still succeeds and every tool page ships with the
 * shell's generic metadata — a failure that is invisible until you inspect the
 * deployed HTML. Hence a test.
 *
 * No dependencies and no build step: `node scripts/postbuild.test.mjs`.
 */

import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildToolHtml } from "./postbuild.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const INDEX = resolve(here, "../apps/shell/index.html");

// Deliberately awkward copy: an em dash, an ampersand and a double quote, so
// attribute escaping is exercised rather than assumed.
const route = {
  slug: "jwt-decoder",
  name: "JWT Decoder",
  description:
    'Decode a JSON Web Token in your browser. Reads the header, payload & expiry. Never uploaded — "private" by construction.',
  keywords: ["jwt decoder", "decode jwt online"],
};

const count = (haystack, needle) => (haystack.match(needle) ?? []).length;

const CHECKS = [
  ["title replaced", (h) => /<title>JWT Decoder — Free Online Tool<\/title>/.test(h)],
  ["exactly one title", (h) => count(h, /<title>/g) === 1],
  ["description replaced", (h) => /<meta name="description" content="Decode a JSON Web Token/.test(h)],
  ["exactly one description", (h) => count(h, /name="description"/g) === 1],
  ["keywords added", (h) => /<meta name="keywords" content="jwt decoder, decode jwt online"/.test(h)],
  [
    "canonical rewritten",
    (h) => /<link rel="canonical" href="https:\/\/shashikanth077\.github\.io\/tools\/jwt-decoder"/.test(h),
  ],
  ["exactly one canonical", (h) => count(h, /rel="canonical"/g) === 1],
  ["og:title replaced", (h) => /<meta property="og:title" content="JWT Decoder/.test(h)],
  ["og:description replaced", (h) => /<meta property="og:description" content="Decode a JSON/.test(h)],
  [
    "og:url replaced",
    (h) => /<meta property="og:url" content="https:\/\/shashikanth077\.github\.io\/tools\/jwt-decoder"/.test(h),
  ],
  ["ampersand escaped", (h) => /payload &amp; expiry/.test(h)],
  ["double quote escaped", (h) => /&quot;private&quot;/.test(h)],
  ["no raw quote breaks an attribute", (h) => !/content="[^"]*"[a-z]/i.test(h)],
  ["module entry preserved", (h) => /<script type="module" src="[^"]*main\.tsx"><\/script>/.test(h)],
  ["head closed exactly once", (h) => count(h, /<\/head>/g) === 1],
  [
    "json-ld parses and is a SoftwareApplication",
    (h) => {
      const match = /<script type="application\/ld\+json">\n([\s\S]*?)\n\s*<\/script>/.exec(h);
      if (!match) return false;
      const parsed = JSON.parse(match[1]);
      return parsed["@type"] === "SoftwareApplication" && parsed.name === "JWT Decoder";
    },
  ],
];

const base = await readFile(INDEX, "utf8");
const html = buildToolHtml(base, route);

let failed = 0;
for (const [label, check] of CHECKS) {
  let ok;
  try {
    ok = check(html);
  } catch (error) {
    ok = false;
    console.log(`  threw: ${error.message}`);
  }
  if (!ok) failed++;
  console.log(`  ${ok ? "pass" : "FAIL"}  ${label}`);
}

console.log(`\n  ${failed === 0 ? `${CHECKS.length} checks passed.` : `${failed} of ${CHECKS.length} failed.`}\n`);
process.exit(failed === 0 ? 0 : 1);
