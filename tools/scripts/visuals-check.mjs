/**
 * Validates the hand-authored visual explanations in apps/shell/src/learn/visuals/.
 *
 *   node scripts/visuals-check.mjs
 *
 * Fails (exit 1) when a visual references a concept that doesn't exist or has a
 * malformed spec (out-of-range actor/node/edge indices, compare rows that don't
 * match the column count, lanes blocks past the timeline). Prints coverage per
 * stack so you can see which concepts still have no picture.
 */
import { build } from "esbuild";
import { readFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const learn = resolve(here, "../apps/shell/src/learn");
const stacks = ["nodejs", "redis"];
const tmp = mkdtempSync(join(tmpdir(), "visuals-"));

const problems = [];
const bad = (stack, id, msg) => problems.push(`${stack} ${id}: ${msg}`);

function check(stack, id, v) {
  const int = (n, max) => Number.isInteger(n) && n >= 0 && n < max;
  switch (v.type) {
    case "sequence":
      if (v.actors.length < 2) bad(stack, id, "needs at least 2 actors");
      if (v.steps.length === 0) bad(stack, id, "no steps");
      v.steps.forEach((s, i) => { if (!int(s.from, v.actors.length) || !int(s.to, v.actors.length)) bad(stack, id, `step ${i + 1} actor index out of range`); });
      break;
    case "flow":
      v.edges.forEach((e, i) => { if (!int(e.from, v.nodes.length) || !int(e.to, v.nodes.length)) bad(stack, id, `edge ${i} node index out of range`); });
      v.path.forEach((p, i) => { if (!int(p, v.edges.length)) bad(stack, id, `path step ${i} edge index out of range`); });
      if (v.notes && v.notes.length !== v.path.length) bad(stack, id, `notes (${v.notes.length}) must match path length (${v.path.length})`);
      if (v.layout === "cycle" && v.nodes.length < 3) bad(stack, id, "cycle needs 3+ nodes");
      break;
    case "lanes":
      v.lanes.forEach((l) => l.blocks.forEach((b) => { if (b.start < 0 || b.start + b.len > v.length) bad(stack, id, `block "${b.label}" runs past timeline length ${v.length}`); }));
      break;
    case "compare":
      v.rows.forEach((r) => { if (r.cells.length !== v.heads.length) bad(stack, id, `row "${r.label}" has ${r.cells.length} cells for ${v.heads.length} columns`); });
      break;
    case "layers":
      if (v.layers.length < 2) bad(stack, id, "needs at least 2 layers");
      break;
    case "queue":
      break;
    default:
      bad(stack, id, `unknown type ${v.type}`);
  }
}

for (const stack of stacks) {
  const out = join(tmp, `${stack}.mjs`);
  await build({ entryPoints: [join(learn, "visuals", `${stack}.ts`)], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "silent" });
  const { visuals } = await import(pathToFileURL(out).href);
  const content = JSON.parse(readFileSync(join(learn, "content", `${stack}.json`), "utf8"));
  const ids = new Set(content.concepts.map((c) => c.id));

  for (const [id, v] of Object.entries(visuals)) {
    if (!ids.has(id)) bad(stack, id, "no such concept id");
    else check(stack, id, v);
  }
  const missing = content.concepts.filter((c) => !visuals[c.id]);
  const types = {};
  Object.values(visuals).forEach((v) => (types[v.type] = (types[v.type] ?? 0) + 1));
  console.log(`${stack}: ${content.concepts.length - missing.length}/${content.concepts.length} concepts have a visual`, types);
  missing.forEach((c) => console.log(`  missing: ${c.id}  ${c.title}`));
}

rmSync(tmp, { recursive: true, force: true });
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log("visuals ok");
