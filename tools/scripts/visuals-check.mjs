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
import { readFileSync, rmSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const learn = resolve(here, "../apps/shell/src/learn");
/** Stacks imported from handbook JSON (visuals in visuals/<slug>.ts) vs authored in TypeScript (content/<slug>.ts). */
const stacks = [
  { slug: "nodejs", authored: false },
  { slug: "redis", authored: false },
  { slug: "python-ai", authored: true },
  { slug: "maths-ai", authored: true },
  { slug: "numpy", authored: true, generatedOutputs: true },
  { slug: "matplotlib", authored: true, generatedOutputs: true },
  { slug: "pandas", authored: true, generatedOutputs: true },
  { slug: "scikit-learn", authored: true },
  { slug: "machine-learning", authored: true, generatedOutputs: true },
];
const tmp = mkdtempSync(join(tmpdir(), "visuals-"));

// The formula evaluator used by the maths diagrams, bundled so we can test every formula at build time.
await build({ entryPoints: [join(learn, "visuals", "expr.ts")], bundle: true, format: "esm", platform: "node", outfile: join(tmp, "expr.mjs"), logLevel: "silent" });
const { compile, evalDefs, template } = await import(pathToFileURL(join(tmp, "expr.mjs")).href);

/** Compile and evaluate every formula in a live diagram at its default slider values. */
function checkLive(stack, id, v) {
  const params = v.params ?? [];
  const names = ["x", ...params.map((p) => p.name), ...(v.defs ?? []).map(([n]) => n)];
  const base = Object.fromEntries(params.map((p) => [p.name, p.value]));
  let scope = base;
  const guard = (what, fn) => { try { return fn(); } catch (e) { bad(stack, id, `${what}: ${e.message}`); return undefined; } };
  guard("defs", () => {
    const defs = (v.defs ?? []).map(([n, e], i) => [n, compile(e, ["x", ...params.map((p) => p.name), ...(v.defs ?? []).slice(0, i).map(([m]) => m)])]);
    scope = evalDefs(defs, base);
  });
  const ev = (what, e, needFinite = true) => guard(what, () => {
    const val = compile(e, names)({ ...scope, x: 0.5 });
    if (needFinite && Number.isNaN(val)) bad(stack, id, `${what} "${e}" is NaN at the default sliders`);
  });
  params.forEach((p) => { if (p.value < p.min || p.value > p.max) bad(stack, id, `slider ${p.name} default ${p.value} is outside ${p.min}..${p.max}`); });
  (v.readout ?? []).forEach((l) => guard("readout", () => template(l, { ...scope, x: 0.5 }, new Map())));
  (v.steps ?? []).forEach((s, i) => Object.keys(s.set ?? {}).forEach((k) => { if (!params.some((p) => p.name === k)) bad(stack, id, `step ${i + 1} sets unknown slider "${k}"`); }));
  if (v.type === "bars") v.bars.forEach((b) => ev("bar", b.value));
  if (v.type === "plot") {
    for (const l of v.layers) {
      if (l.show) ev("show", l.show);
      if (l.label) guard("label", () => template(l.label, { ...scope, x: 0.5 }, new Map()));
      for (const [k, val] of Object.entries(l)) {
        if (["kind", "color", "dash", "label", "show", "fill"].includes(k)) continue;
        if (k === "pts") l.pts.forEach(([a, b]) => { ev("polygon x", a); ev("polygon y", b); });
        else if (typeof val === "string") ev(`${l.kind}.${k}`, val, l.kind !== "curve");
      }
      if (l.kind === "curve") guard("curve", () => compile(l.y, names));
    }
  }
}

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
    case "plot":
    case "bars":
      checkLive(stack, id, v);
      break;
    case "matmul":
      if (v.a.some((r) => r.length !== v.b.length)) bad(stack, id, "matmul: columns of A must equal rows of B");
      break;
    case "trace":
      v.steps.forEach((s, i) => { if (!int(s.line - 1, v.code.length)) bad(stack, id, `step ${i + 1} line ${s.line} is outside the ${v.code.length}-line code`); });
      break;
    case "cells": {
      let rows = v.rows;
      v.steps.forEach((s, i) => {
        rows = s.rows ?? rows;
        (s.hl ?? []).forEach(([r, from, to]) => {
          const row = rows[r];
          if (!row) bad(stack, id, `step ${i + 1} highlights missing row ${r}`);
          else if (from > to || !int(from, row.cells.length) || !int(to, row.cells.length)) bad(stack, id, `step ${i + 1} highlight ${from}-${to} is outside row "${row.name}" (${row.cells.length} cells)`);
        });
      });
      break;
    }
    default:
      bad(stack, id, `unknown type ${v.type}`);
  }
}

for (const { slug: stack, authored, generatedOutputs } of stacks) {
  let content;
  let visuals;
  if (authored) {
    // Authored stacks define content and visuals together in TypeScript.
    const out = join(tmp, `${stack}.mjs`);
    await build({ entryPoints: [join(learn, "content", `${stack}.ts`)], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "silent" });
    ({ content, visuals } = await import(pathToFileURL(out).href));
  } else {
    const out = join(tmp, `${stack}.mjs`);
    await build({ entryPoints: [join(learn, "visuals", `${stack}.ts`)], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "silent" });
    ({ visuals } = await import(pathToFileURL(out).href));
    content = JSON.parse(readFileSync(join(learn, "content", `${stack}.json`), "utf8"));
  }
  const ids = new Set(content.concepts.map((c) => c.id));

  for (const [id, v] of Object.entries(visuals)) {
    if (!ids.has(id)) bad(stack, id, "no such concept id");
    else check(stack, id, v);
  }

  if (authored) {
    // Keep the catalog's stats in sync with the authored content.
    const stats = {
      concepts: content.concepts.length,
      questions: content.questions.length,
      drills: content.drills?.length ?? 0,
      codeLab: content.codeLab?.length ?? 0,
      areas: content.areas.length,
    };
    writeFileSync(join(learn, "content", `${stack}.stats.json`), JSON.stringify(stats, null, 2) + "\n");
    const areaIds = new Set(content.areas.map((a) => a.id));
    content.concepts.forEach((c) => { if (!areaIds.has(c.area)) bad(stack, c.id, `unknown area ${c.area}`); });
    content.questions.forEach((q) => { if (!areaIds.has(q.area)) bad(stack, q.id, `question has unknown area ${q.area}`); });
    content.drills?.forEach((d, i) => { if (d.options.filter((o) => o.correct).length !== 1) bad(stack, `drill ${i + 1}`, "must have exactly one correct option"); });
  }

  if (generatedOutputs) {
    // Outputs come from running the code (npm run outputs); every example with code must have one.
    content.concepts.forEach((c) => {
      if (c.code && c.output === undefined && /print\(/.test(c.code)) bad(stack, c.id, `no generated output — run: npm run outputs -- ${stack}`);
    });
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
