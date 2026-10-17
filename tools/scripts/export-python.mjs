/**
 * Exports every concept's example from the Python-based learning tracks as a
 * standalone, commented .py file.
 *
 *   node scripts/export-python.mjs            # all tracks
 *   node scripts/export-python.mjs numpy      # one track
 *
 * Writes ../python-examples/<slug>/<NN-area>/<NN>_<concept-id>.py plus a README
 * index per track. Each file starts with a comment block (what the concept is,
 * where it is used, how to run it, the expected output). Re-run after editing
 * any example. Files that fail `python -m py_compile` are reported, not written.
 */
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const learn = resolve(here, "../apps/shell/src/learn");
const outRoot = resolve(here, "../../python-examples");
const { build } = createRequire(resolve(here, "../package.json"))("esbuild");

const SLUGS = ["python-ai", "maths-ai", "numpy", "matplotlib", "pandas", "scikit-learn", "machine-learning", "neural-networks", "nlp", "reinforcement-learning", "computer-vision", "speech-processing", "generative-ai", "agentic-ai", "building-with-claude", "langchain-langgraph-rag", "fraud-detection"];
const only = process.argv[2];
const slugs = only ? [only] : SLUGS;
const tmp = mkdtempSync(join(tmpdir(), "pyexport-"));

/** Turn free text into `# ` comment lines wrapped at ~78 columns. */
function comment(text, prefix = "# ") {
  const lines = [];
  for (const para of String(text).split(/\n+/)) {
    let line = "";
    for (const w of para.replace(/[*`]/g, "").replace(/\{\{|\}\}/g, "").split(/\s+/).filter(Boolean)) {
      if ((line + " " + w).trim().length > 76) { lines.push(prefix + line); line = w; }
      else line = (line + " " + w).trim();
    }
    if (line) lines.push(prefix + line);
  }
  return lines.join("\n");
}
const kebab = (s) => s.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();

let written = 0, skipped = 0;
for (const slug of slugs) {
  const bundle = join(tmp, `${slug}.mjs`);
  await build({ entryPoints: [join(learn, "content", `${slug}.ts`)], bundle: true, format: "esm", platform: "node", outfile: bundle, logLevel: "silent", loader: { ".json": "json" } });
  const { content } = await import(pathToFileURL(bundle).href);
  const areaIdx = new Map(content.areas.map((a, i) => [a.id, i]));
  const areaName = new Map(content.areas.map((a) => [a.id, a.name]));
  const index = [];
  const counters = new Map();

  for (const c of content.concepts) {
    if (!c.code) continue;
    const n = (counters.get(c.area) ?? 0) + 1;
    counters.set(c.area, n);
    const dir = join(outRoot, slug, `${String(areaIdx.get(c.area) + 1).padStart(2, "0")}-${kebab(areaName.get(c.area) ?? c.area)}`);
    const file = join(dir, `${String(n).padStart(2, "0")}_${kebab(c.id.replace(":", "-"))}.py`);
    const header = [
      "# -*- coding: utf-8 -*-",
      `# ${"=".repeat(74)}`,
      comment(`${c.title}  [${slug} / ${areaName.get(c.area) ?? c.area}]`),
      `# ${"=".repeat(74)}`,
      "# WHAT IT IS",
      comment(c.summary),
      ...(c.production ? ["#", "# WHERE YOU USE IT", comment(c.production)] : []),
      "#",
      `# RUN IT:  python ${file.split("/").pop()}`,
      "#",
    ].join("\n");
    const out = c.output ? "\n\n# " + "-".repeat(74) + "\n# EXPECTED OUTPUT\n" + c.output.split("\n").map((l) => ("# " + l).trimEnd()).join("\n") : "";
    const body = `${header}\n\n${c.code.replace(/\s+$/, "")}${out}\n`;

    mkdirSync(dir, { recursive: true });
    writeFileSync(file, body);
    const r = spawnSync("python3", ["-I", "-m", "py_compile", file], { encoding: "utf8" });
    if (r.status !== 0) {
      rmSync(file);
      skipped++;
      console.error(`SKIP ${slug} ${c.id}: ${r.stderr.trim().split("\n").slice(-2).join(" ")}`);
      continue;
    }
    written++;
    index.push(`| ${c.title.replace(/\|/g, "/")} | \`${file.slice(join(outRoot, slug).length + 1)}\` |`);
  }
  if (index.length) {
    mkdirSync(join(outRoot, slug), { recursive: true });
    writeFileSync(join(outRoot, slug, "README.md"), `# ${slug} — Python examples\n\nOne small, commented script per concept. Run any file with \`python <file>\`.\n\n| Concept | File |\n|---|---|\n${index.join("\n")}\n`);
  }
  console.log(`${slug}: ${index.length} files`);
}
rmSync(tmp, { recursive: true, force: true });
console.log(`done: ${written} written, ${skipped} skipped`);
