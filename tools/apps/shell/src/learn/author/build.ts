import type { Concept, Drill, Level, StackContent } from "../types.js";
import type { Visual, VisualMap } from "../visuals/types.js";

/**
 * Authoring helpers for stacks written by hand (as opposed to imported from a
 * handbook HTML). One definition holds a concept AND its animated diagram, so
 * the two can never drift apart; ids are `<area>:<index>` exactly like the importer.
 */

/** Python code contains backslashes (\n, \t): String.raw keeps them literal. */
export const py = String.raw;

export interface ConceptDef {
  /** title */
  t: string;
  /** level: 1 core, 2 expected, 3 advanced */
  lv: Level;
  /** explanation — {{code}} marks inline code */
  s: string;
  /** the "in practice" callout (labels.production) */
  r: string;
  /** the interview callout (labels.interview) */
  i: string;
  /** example code */
  c?: string;
  /** what the example prints */
  o?: string;
  /** animated diagram */
  v: Visual;
}

export type QuestionDef = [area: string, level: Level, q: string, a: string];

export interface DrillDef {
  t: string;
  /** the question asked */
  q: string;
  code: string;
  /** options as [text, correct, why] */
  opts: [string, boolean, string][];
  /** step-by-step trace lines */
  path: string[];
  why: string;
  watch: string;
  remember: string;
}

export interface StackSource {
  areas: [id: string, name: string, short: string][];
  concepts: Record<string, ConceptDef[]>;
  questions: QuestionDef[];
  drills: DrillDef[];
  codeLab: [title: string, brief: string, code: string][];
  glance: [string, string][];
  lists: [string, string[]][];
  materials: [string, [string, string][]][];
}

export function buildStack(src: StackSource): { content: StackContent; visuals: VisualMap } {
  const concepts: Concept[] = [];
  const visuals: VisualMap = {};

  for (const [area] of src.areas) {
    (src.concepts[area] ?? []).forEach((d, i) => {
      const id = `${area}:${i}`;
      concepts.push({
        id,
        area,
        title: d.t,
        level: d.lv,
        summary: d.s,
        production: d.r,
        interview: d.i,
        ...(d.c ? { code: d.c.replace(/^\n/, "").replace(/\n$/, "") } : {}),
        ...(d.o ? { output: d.o } : {}),
      });
      visuals[id] = d.v;
    });
  }

  const drills: Drill[] = src.drills.map((d) => ({
    title: d.t,
    context: d.q,
    code: d.code.replace(/^\n/, "").replace(/\n$/, ""),
    symptoms: [],
    options: d.opts.map(([text, correct, why]) => ({ text, correct, why })),
    path: d.path,
    fix: d.why,
    prevent: d.watch,
    interview: d.remember,
  }));

  const content: StackContent = {
    areas: src.areas.map(([id, name, short]) => ({ id, name, short })),
    concepts,
    questions: src.questions.map(([area, level, q, a], i) => ({ id: `q${i}`, area, level, q, a })),
    drills,
    codeLab: src.codeLab.map(([title, brief, code]) => ({ title, brief, code: code.replace(/^\n/, "").replace(/\n$/, "") })),
    interview: {
      stages: [],
      seniority: [],
      frameworks: [],
      glance: src.glance.map(([title, text]) => ({ title, text })),
      lists: src.lists.map(([title, items]) => ({ title, items })),
      stories: [],
    },
    materials: src.materials.map(([title, links]) => ({ title, links: links.map(([label, url]) => ({ label, url })) })),
  };

  return { content, visuals };
}
