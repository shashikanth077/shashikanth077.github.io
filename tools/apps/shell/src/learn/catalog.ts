import type { StackContent, StackStats } from "./types.js";
import nodeStats from "./content/nodejs.stats.json";
import redisStats from "./content/redis.stats.json";

/**
 * Every learning stack the portal knows about. To add one:
 *   1. node scripts/import-handbook.mjs <handbook.html> <slug>
 *   2. add an entry here with status "live", `stats` and a `load` that imports the JSON
 * Stacks without `load` render as "coming soon" cards.
 */
export type StackCategory = "Backend" | "Frontend" | "Database" | "Language";
export const STACK_CATEGORIES: StackCategory[] = ["Backend", "Frontend", "Database", "Language"];

export interface Stack {
  slug: string;
  name: string;
  category: StackCategory;
  /** Tab label for the stack-specific explorer (content.patterns), e.g. "Caching patterns". */
  patternsLabel?: string;
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
    category: "Backend",
    icon: "⬢",
    accent: "#3d9a50",
    tagline: "Backend engineering, 2026 edition",
    blurb:
      "Runtime internals, async and streams, APIs, databases, security, observability and system design — each concept with the production angle and how interviewers probe it.",
    audience: "Backend and full-stack developers, junior to staff",
    stats: nodeStats,
    load: () => import("./content/nodejs.json").then((m) => m.default as unknown as StackContent),
  },
  {
    slug: "redis",
    name: "Redis",
    category: "Database",
    patternsLabel: "Caching patterns",
    icon: "◆",
    accent: "#dc382d",
    tagline: "Caching strategies and in-memory data",
    blurb:
      "Six caching patterns step by step, expiration and eviction, invalidation, stampedes, data modelling, clustering and security — with Node.js recipes and design cases.",
    audience: "Backend developers and anyone designing for scale",
    stats: redisStats,
    load: () => import("./content/redis.json").then((m) => m.default as unknown as StackContent),
  },
  { slug: "react", name: "React", category: "Frontend", icon: "⚛", accent: "#2f9ec4", tagline: "Components, hooks, rendering", blurb: "Rendering model, state, effects, performance and testing.", audience: "Frontend developers" },
  { slug: "redux", name: "Redux", category: "Frontend", icon: "◈", accent: "#7e57c2", tagline: "State management that scales", blurb: "Redux Toolkit, RTK Query, normalisation and async patterns.", audience: "React developers" },
  { slug: "javascript", name: "JavaScript", category: "Language", icon: "JS", accent: "#d4a017", tagline: "The language under everything", blurb: "Closures, async, the event loop, modules and modern syntax.", audience: "Every web developer" },
  { slug: "mysql", name: "MySQL", category: "Database", icon: "▤", accent: "#2b7a9e", tagline: "Relational design and tuning", blurb: "Schema design, indexing, transactions, query plans and replication.", audience: "Backend developers" },
];

export const findStack = (slug: string | undefined) => stacks.find((s) => s.slug === slug);
