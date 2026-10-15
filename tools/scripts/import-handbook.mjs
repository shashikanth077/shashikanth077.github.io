/**
 * Converts a self-contained "developer handbook" HTML file (the generator style
 * used for the Node.js 2026 handbook) into the JSON the Resources portal renders.
 *
 *   node scripts/import-handbook.mjs <handbook.html> <stack-slug>
 *
 * Output:  apps/shell/src/learn/content/<slug>.json   (lazy-loaded per stack)
 *          apps/shell/src/learn/content/<slug>.stats.json (counts for the catalog)
 *
 * The handbook keeps all its content in plain JS arrays between the
 * "/* ===== DATA" and "/* ===== ENGINE" markers. We evaluate just that slice in a
 * sandbox (no DOM, no network) and reshape the arrays into named objects.
 * Optional arrays (releases, drills, …) are simply omitted when a handbook
 * has none, so React / Redux handbooks with fewer sections still import.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const [, , input, slug] = process.argv;
if (!input || !slug) {
  console.error("usage: node scripts/import-handbook.mjs <handbook.html> <stack-slug>");
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "../apps/shell/src/learn/content");

const lines = readFileSync(input, "utf8").split("\n");
// Data begins at the first of: `var DOM=` (areas) or a DATA marker — handbooks differ in whether the first block is marked.
const start = lines.findIndex((l) => /^var DOM\s*=/.test(l) || l.includes("/* ===== DATA"));
const end = lines.findIndex((l) => l.includes("/* ===== ENGINE"));
if (start < 0 || end < 0) throw new Error("DATA / ENGINE markers not found — is this a handbook file?");

const names = ["DOM", "CON", "KEEP", "GAP", "REL", "FEAT", "UPCHK", "SC", "INC", "ARCH", "CL", "STG", "SEN", "FRAME", "GLANCE", "LISTS", "STORY", "QA", "MAT", "PATD", "RATE_LABELS"];
const probe = names.map((n) => `typeof ${n} !== "undefined" ? ${n} : undefined`).join(",");
const raw = vm.runInNewContext(`${lines.slice(start, end).join("\n")}\n;[${probe}]`);
const d = Object.fromEntries(names.map((n, i) => [n, raw[i]]));

const maybe = (v, fn) => (Array.isArray(v) && v.length ? fn(v) : undefined);

const content = {
  areas: d.DOM.map(([id, name, short]) => ({ id, name, short })),
  concepts: d.CON.map((c) => ({
    id: c.id,
    area: c.d,
    title: c.t,
    level: c.lv,
    summary: c.s,
    production: c.r,
    interview: c.i,
    ...(c.c ? { code: c.c } : {}),
  })),
  questions: d.QA.map((q) => ({ id: q.id, area: q.d, level: q.lv, q: q.q, a: q.a })),
  drills: maybe(d.SC, (v) =>
    v.map((s) => ({
      title: s.t,
      context: s.ctx,
      symptoms: s.sym,
      options: s.opts.map(([text, correct, why]) => ({ text, correct, why })),
      path: s.path,
      fix: s.fix,
      prevent: s.prevent,
      interview: s.int,
    })),
  ),
  incidents: maybe(d.INC, (v) => v.map(([title, body]) => ({ title, body }))),
  codeLab: maybe(d.CL, (v) => v.map(([title, brief, code]) => ({ title, brief, code }))),
  architecture: maybe(d.ARCH, (v) => v.map(([name, role, risk, question]) => ({ name, role, risk, question }))),
  platform: maybe(d.REL, (rel) => ({
    releases: rel.map((r) => ({ name: r.n, phases: r.seg.map(([kind, from, to, label]) => ({ kind, from, to, label })) })),
    features: (d.FEAT ?? []).map(([name, since, group, note]) => ({ name, since, group, note })),
    upgradeChecklist: d.UPCHK ?? [],
  })),
  patterns: maybe(d.PATD, (v) => ({
    ratingLabels: d.RATE_LABELS ?? [],
    items: v.map((p) => ({
      name: p.n,
      description: p.desc,
      read: p.read.map(([actor, action]) => ({ actor, action })),
      write: p.write.map(([actor, action]) => ({ actor, action })),
      ratings: p.rate,
      useWhen: p.use,
      watchOut: p.avoid,
    })),
  })),
  interview: {
    stages: (d.STG ?? []).map(([name, checks, prep]) => ({ name, checks, prep })),
    seniority: (d.SEN ?? []).map(([area, mid, senior, staff]) => ({ area, mid, senior, staff })),
    frameworks: (d.FRAME ?? []).map(([name, steps]) => ({ name, steps })),
    glance: (d.GLANCE ?? []).map(([title, text]) => ({ title, text })),
    lists: (d.LISTS ?? []).map(([title, items]) => ({ title, items })),
    stories: (d.STORY ?? []).map(([title, ...parts]) => ({ title, parts })),
  },
  materials: (d.MAT ?? []).map(([title, links]) => ({ title, links: links.map(([label, url]) => ({ label, url })) })),
};

const stats = {
  concepts: content.concepts.length,
  questions: content.questions.length,
  drills: content.drills?.length ?? 0,
  codeLab: content.codeLab?.length ?? 0,
  patterns: content.patterns?.items.length ?? 0,
  areas: content.areas.length,
};

mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, `${slug}.json`), JSON.stringify(content));
writeFileSync(resolve(outDir, `${slug}.stats.json`), JSON.stringify(stats, null, 2) + "\n");
console.log(`${slug}:`, stats);
