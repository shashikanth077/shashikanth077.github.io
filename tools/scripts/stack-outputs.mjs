/**
 * Generates the "Output" panels for an authored stack by RUNNING its example code.
 *
 *   node scripts/stack-outputs.mjs numpy
 *
 * Needs Python 3 with the stack's libraries installed (for numpy: pip install numpy).
 * Writes apps/shell/src/learn/content/<slug>.outputs.json, which the stack's content
 * module passes to buildStack(). Re-run after editing any example code; `npm test`
 * fails if an output is missing. Each snippet runs in its own empty temp folder, so
 * snippets that write files (savetxt, save, …) are safe.
 */
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const slug = process.argv[2];
if (!slug) {
  console.error("usage: node scripts/stack-outputs.mjs <slug>");
  process.exit(1);
}
const here = dirname(fileURLToPath(import.meta.url));
const learn = resolve(here, "../apps/shell/src/learn");
const { build } = createRequire(resolve(here, "../package.json"))("esbuild");
const tmp = mkdtempSync(join(tmpdir(), "outputs-"));
const outFile = join(learn, "content", `${slug}.outputs.json`);

// The content module imports the outputs file, so make sure one exists before bundling.
try { readFileSync(outFile); } catch { writeFileSync(outFile, "{}\n"); }

const bundle = join(tmp, "m.mjs");
await build({ entryPoints: [join(learn, "content", `${slug}.ts`)], bundle: true, format: "esm", platform: "node", outfile: bundle, logLevel: "silent", loader: { ".json": "json" } });
const { content } = await import(pathToFileURL(bundle).href);

function run(code) {
  const dir = mkdtempSync(join(tmp, "run-"));
  writeFileSync(join(dir, "s.py"), code);
  const r = spawnSync("python", ["-X", "utf8", "s.py"], { cwd: dir, encoding: "utf8" });
  return { ok: r.status === 0, out: (r.stdout ?? "").replace(/\r\n/g, "\n").trimEnd(), err: (r.stderr ?? "").trim().split("\n").slice(-3).join(" | ") };
}

const outputs = {};
let failed = 0;
for (const c of content.concepts) {
  if (!c.code) continue;
  const r = run(c.code);
  if (!r.ok) {
    failed++;
    console.error(`FAIL  ${c.id}  ${c.title}\n      ${r.err}`);
    continue;
  }
  if (r.out) outputs[c.id] = r.out;
}
for (const [kind, list] of [["exercise", content.codeLab ?? []], ["drill", content.drills ?? []]]) {
  for (const item of list) {
    const code = item.code;
    if (!code) continue;
    const r = run(code);
    if (!r.ok) {
      failed++;
      console.error(`FAIL  ${kind}  ${item.title}\n      ${r.err}`);
    }
  }
}

rmSync(tmp, { recursive: true, force: true });
writeFileSync(outFile, JSON.stringify(outputs, null, 2) + "\n");
console.log(`${slug}: wrote ${Object.keys(outputs).length} outputs${failed ? `, ${failed} FAILED` : ""}`);
process.exit(failed ? 1 : 0);
