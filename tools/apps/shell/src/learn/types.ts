/** Shape of apps/shell/src/learn/content/<stack>.json — produced by scripts/import-handbook.mjs. */
export type Level = 1 | 2 | 3;

export const LEVEL_LABEL: Record<Level, string> = { 1: "Core", 2: "Expected", 3: "Advanced" };

export interface Area { id: string; name: string; short: string }

export interface Concept {
  id: string;
  area: string;
  title: string;
  level: Level;
  summary: string;
  production: string;
  interview: string;
  code?: string;
}

export interface Question { id: string; area: string; level: Level; q: string; a: string }

export interface Drill {
  title: string;
  context: string;
  symptoms: string[];
  options: { text: string; correct: boolean; why: string }[];
  path: string[];
  fix: string;
  prevent: string;
  interview: string;
}

export interface StackContent {
  areas: Area[];
  concepts: Concept[];
  questions: Question[];
  drills?: Drill[];
  incidents?: { title: string; body: string }[];
  codeLab?: { title: string; brief: string; code: string }[];
  architecture?: { name: string; role: string; risk: string; question: string }[];
  platform?: {
    releases: { name: string; phases: { kind: string; from: string; to: string; label: string }[] }[];
    features: { name: string; since: string; group: string; note: string }[];
    upgradeChecklist: string[];
  };
  /** Stack-specific explorer: e.g. the six Redis caching patterns, each with read/write flows and trade-off ratings. */
  patterns?: {
    ratingLabels: string[];
    items: {
      name: string;
      description: string;
      read: { actor: string; action: string }[];
      write: { actor: string; action: string }[];
      ratings: number[];
      useWhen: string;
      watchOut: string;
    }[];
  };
  interview: {
    stages: { name: string; checks: string[]; prep: string[] }[];
    seniority: { area: string; mid: string; senior: string; staff: string }[];
    frameworks: { name: string; steps: string[] }[];
    glance: { title: string; text: string }[];
    lists: { title: string; items: string[] }[];
    stories: { title: string; parts: string[] }[];
  };
  materials: { title: string; links: { label: string; url: string }[] }[];
}

export interface StackStats { concepts: number; questions: number; drills: number; codeLab: number; patterns?: number; areas: number }
