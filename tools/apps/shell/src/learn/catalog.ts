import type { StackContent, StackStats } from "./types.js";
import nodeStats from "./content/nodejs.stats.json";

/**
 * Every learning stack the portal knows about. To add one:
 *   1. node scripts/import-handbook.mjs <handbook.html> <slug>
 *   2. add an entry here with status "live", `stats` and a `load` that imports the JSON
 * Stacks without `load` render as "coming soon" cards.
 */
export interface Stack {
  slug: string;
  name: string;
  icon: string;
  /** CSS colour for the card/workspace accent. */
  accent: string;
  tagline: string;
  blurb: string;
  audience: string;
  stats?: StackStats;
  load?: () => Promise<StackContent>;
}

export const stacks: Stack[] = [
  {
    slug: "nodejs",
    name: "Node.js",
    icon: "⬢",
    accent: "#3d9a50",
    tagline: "Backend engineering, 2026 edition",
    blurb:
      "Runtime internals, async and streams, APIs, databases, security, observability and system design — each concept with the production angle and how interviewers probe it.",
    audience: "Backend and full-stack developers, junior to staff",
    stats: nodeStats,
    load: () => import("./content/nodejs.json").then((m) => m.default as unknown as StackContent),
  },
  { slug: "react", name: "React", icon: "⚛", accent: "#2f9ec4", tagline: "Components, hooks, rendering", blurb: "Rendering model, state, effects, performance and testing.", audience: "Frontend developers" },
  { slug: "redux", name: "Redux", icon: "◈", accent: "#7e57c2", tagline: "State management that scales", blurb: "Redux Toolkit, RTK Query, normalisation and async patterns.", audience: "React developers" },
];

export const findStack = (slug: string | undefined) => stacks.find((s) => s.slug === slug);
