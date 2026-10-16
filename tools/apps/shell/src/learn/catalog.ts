import type { StackContent, StackStats } from "./types.js";
import type { VisualMap } from "./visuals/types.js";
import nodeStats from "./content/nodejs.stats.json";
import redisStats from "./content/redis.stats.json";
import pythonAiStats from "./content/python-ai.stats.json";
import mathsAiStats from "./content/maths-ai.stats.json";
import numpyStats from "./content/numpy.stats.json";
import matplotlibStats from "./content/matplotlib.stats.json";

/**
 * Every learning stack the portal knows about. Two sections share one workspace:
 *   - "dev": developer stacks under /resources (Node.js, Redis, …)
 *   - "ai":  the AI Atlas under /ai (Python for AI, Maths, ML, …)
 *
 * To add a stack:
 *   - from a handbook HTML:  node scripts/import-handbook.mjs <handbook.html> <slug>
 *   - or author it by hand:  learn/author/ (see CLAUDE.md)
 * then add an entry here with `stats` and `load`. Entries without `load` render as "coming soon".
 */
export type StackSection = "dev" | "ai";

export type StackCategory = "Backend" | "Frontend" | "Database" | "Language";
export const STACK_CATEGORIES: StackCategory[] = ["Backend", "Frontend", "Database", "Language"];

/** Order of the AI Atlas roadmap. */
export const AI_STAGES = ["Foundations", "Core machine learning", "Modern AI"] as const;
export type AiStage = (typeof AI_STAGES)[number];

/** Wording that differs between stacks (defaults suit the developer stacks). */
export interface StackLabels {
  /** Callout on each concept, default "In production". */
  production?: string;
  /** Callout on each concept, default "How interviewers probe it". */
  interview?: string;
  drillsTab?: string;
  drillsIntro?: string;
  drillQuestion?: string;
  drillPath?: string;
  drillFix?: string;
  drillPrevent?: string;
  drillInterview?: string;
  drillDone?: string;
  codeTab?: string;
  codeIntro?: string;
}

export interface Stack {
  slug: string;
  name: string;
  section: StackSection;
  category?: StackCategory;
  /** AI Atlas only: which roadmap stage the track belongs to. */
  stage?: AiStage;
  /** Tab label for the stack-specific explorer (content.patterns), e.g. "Caching patterns". */
  patternsLabel?: string;
  labels?: StackLabels;
  icon: string;
  /** CSS colour for the card/workspace accent. */
  accent: string;
  tagline: string;
  blurb: string;
  audience: string;
  /** Planned topics, shown on "coming soon" cards. */
  planned?: string[];
  stats?: StackStats;
  load?: () => Promise<StackContent>;
  /** Hand-authored animated explanations, keyed by concept id (see learn/visuals/). */
  loadVisuals?: () => Promise<VisualMap>;
}

export const SECTION_META: Record<StackSection, { base: string; label: string; crumb: string }> = {
  dev: { base: "/resources", label: "Learning portal", crumb: "Learning portal" },
  ai: { base: "/ai", label: "AI Atlas", crumb: "AI Atlas" },
};

export const stackPath = (s: Pick<Stack, "slug" | "section">) => `${SECTION_META[s.section].base}/${s.slug}`;

/** Wording for the "learn to code for AI" tracks (Python, NumPy…). */
const codeStackLabels: StackLabels = {
  production: "In AI work",
  interview: "Interview angle",
  drillsTab: "Predict the output",
  drillsIntro: "Read the code, predict what it prints, then step through exactly what Python does. Most Python interview traps live here.",
  drillQuestion: "What does this print?",
  drillPath: "Step-by-step trace",
  drillFix: "Why",
  drillPrevent: "Watch out",
  drillInterview: "Remember",
  drillDone: "✓ predicted",
  codeTab: "Exercises",
  codeIntro: "Hands-on exercises and mini-projects. Try each in your own editor first, then open the solution.",
};

export const stacks: Stack[] = [
  /* ---------------- developer stacks ---------------- */
  {
    slug: "nodejs",
    name: "Node.js",
    section: "dev",
    category: "Backend",
    icon: "⬢",
    accent: "#3d9a50",
    tagline: "Backend engineering, 2026 edition",
    blurb:
      "Runtime internals, async and streams, APIs, databases, security, observability and system design — each concept with the production angle and how interviewers probe it.",
    audience: "Backend and full-stack developers, junior to staff",
    stats: nodeStats,
    load: () => import("./content/nodejs.json").then((m) => m.default as unknown as StackContent),
    loadVisuals: () => import("./visuals/nodejs.js").then((m) => m.visuals),
  },
  {
    slug: "redis",
    name: "Redis",
    section: "dev",
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
    loadVisuals: () => import("./visuals/redis.js").then((m) => m.visuals),
  },
  { slug: "react", name: "React", section: "dev", category: "Frontend", icon: "⚛", accent: "#2f9ec4", tagline: "Components, hooks, rendering", blurb: "Rendering model, state, effects, performance and testing.", audience: "Frontend developers" },
  { slug: "redux", name: "Redux", section: "dev", category: "Frontend", icon: "◈", accent: "#7e57c2", tagline: "State management that scales", blurb: "Redux Toolkit, RTK Query, normalisation and async patterns.", audience: "React developers" },
  { slug: "javascript", name: "JavaScript", section: "dev", category: "Language", icon: "JS", accent: "#d4a017", tagline: "The language under everything", blurb: "Closures, async, the event loop, modules and modern syntax.", audience: "Every web developer" },
  { slug: "mysql", name: "MySQL", section: "dev", category: "Database", icon: "▤", accent: "#2b7a9e", tagline: "Relational design and tuning", blurb: "Schema design, indexing, transactions, query plans and replication.", audience: "Backend developers" },

  /* ---------------- AI Atlas ---------------- */
  {
    slug: "python-ai",
    name: "Python for AI",
    section: "ai",
    stage: "Foundations",
    icon: "🐍",
    accent: "#3b82c4",
    tagline: "The Python every AI engineer uses daily",
    blurb:
      "Lists, tuples, dictionaries, functions, classes and file handling — taught with step-by-step execution traces and memory diagrams, and tied to the ML code you will write next.",
    audience: "Beginners starting AI, and developers coming from other languages",
    labels: codeStackLabels,
    stats: pythonAiStats,
    load: () => import("./content/python-ai.js").then((m) => m.content),
    loadVisuals: () => import("./content/python-ai.js").then((m) => m.visuals),
  },
  {
    slug: "maths-ai",
    name: "Maths for AI",
    section: "ai",
    stage: "Foundations",
    icon: "∑",
    accent: "#c4572f",
    tagline: "From slope to gradient descent — watch every formula move",
    blurb:
      "Lines and slope, vectors, matrices, statistics, probability, derivatives and the chain rule — each idea as an interactive graph you can drag, tied to how it trains a neural network.",
    audience: "Anyone who wants to understand ML, not just call its libraries — no advanced maths assumed",
    labels: {
      production: "Where it shows up in AI",
      interview: "Interview angle",
      drillsTab: "Work it out",
      drillsIntro: "Short calculations that interviews love. Work each one out first, then open the step-by-step solution.",
      drillQuestion: "What is the answer?",
      drillPath: "Step by step",
      drillFix: "Why",
      drillPrevent: "Watch out",
      drillInterview: "Remember",
      drillDone: "✓ solved",
      codeTab: "Practice problems",
      codeIntro: "Build each idea in code. Try it yourself first, then compare with the worked solution.",
    },
    stats: mathsAiStats,
    load: () => import("./content/maths-ai.js").then((m) => m.content),
    loadVisuals: () => import("./content/maths-ai.js").then((m) => m.visuals),
  },
  {
    slug: "numpy",
    name: "NumPy",
    section: "ai",
    stage: "Foundations",
    icon: "▦",
    accent: "#2b9a8c",
    tagline: "The array library under every AI framework",
    blurb:
      "Arrays, indexing and slicing, broadcasting, axes, reshaping, linear algebra and random data — each shown as moving diagrams of the actual numbers, then applied to images, scaling and a neural-network layer.",
    audience: "Learners who finished Python for AI, and anyone moving from Python lists to data work",
    labels: codeStackLabels,
    stats: numpyStats,
    load: () => import("./content/numpy.js").then((m) => m.content),
    loadVisuals: () => import("./content/numpy.js").then((m) => m.visuals),
  },
  {
    slug: "matplotlib",
    name: "Matplotlib",
    section: "ai",
    stage: "Foundations",
    icon: "📊",
    accent: "#e07a2f",
    tagline: "See your data: charts you can read and trust",
    blurb:
      "Line, bar, scatter, histogram, box and pie charts, subplots, heatmaps and learning curves — each built step by step with sliders you can drag, then applied to NumPy, pandas and model diagnostics.",
    audience: "Learners who finished NumPy, and anyone who needs to explain data visually",
    labels: codeStackLabels,
    stats: matplotlibStats,
    load: () => import("./content/matplotlib.js").then((m) => m.content),
    loadVisuals: () => import("./content/matplotlib.js").then((m) => m.visuals),
  },
  { slug: "pandas", name: "Pandas", section: "ai", stage: "Foundations", icon: "🐼", accent: "#6a5acd", tagline: "Tables of data, cleaned and combined", blurb: "DataFrames, selecting and filtering, grouping, joins, missing data and preparing datasets for models.", audience: "Learners who finished NumPy", planned: ["DataFrames and Series", "Selecting and filtering", "Group by and joins", "Cleaning messy data"] },
  { slug: "machine-learning", name: "Machine Learning", section: "ai", stage: "Core machine learning", icon: "📈", accent: "#7c5cff", tagline: "From regression to ensembles", blurb: "Supervised and unsupervised learning, features, evaluation, overfitting, and the scikit-learn workflow.", audience: "Learners who finished Python and Maths for AI", planned: ["Regression and classification", "Trees and ensembles", "Evaluation", "Clustering"] },
  { slug: "neural-networks", name: "Neural Networks", section: "ai", stage: "Core machine learning", icon: "🕸", accent: "#d6489a", tagline: "Neurons, layers, backpropagation", blurb: "How a network computes and learns, one neuron and one gradient at a time.", audience: "Learners ready for deep learning", planned: ["Perceptron", "Activation functions", "Backpropagation", "Optimisers"] },
  { slug: "deep-learning", name: "Deep Learning", section: "ai", stage: "Core machine learning", icon: "🧠", accent: "#5a67d8", tagline: "CNNs, RNNs, transformers", blurb: "Convolutions, sequence models, attention and training deep networks in PyTorch.", audience: "Learners who finished neural networks", planned: ["CNNs", "Sequence models", "Attention", "Training at scale"] },
  { slug: "generative-ai", name: "Generative AI", section: "ai", stage: "Modern AI", icon: "✨", accent: "#e0841f", tagline: "LLMs, prompting, RAG", blurb: "How large language models work, how to prompt them, retrieval-augmented generation and evaluation.", audience: "Developers building with LLMs", planned: ["Tokens and embeddings", "Transformers", "Prompting and RAG", "Fine-tuning"] },
  { slug: "agentic-ai", name: "Agentic AI", section: "ai", stage: "Modern AI", icon: "🤖", accent: "#18a3a3", tagline: "Tools, planning, multi-agent systems", blurb: "Agent loops, tool use, memory, planning and guardrails for systems that act.", audience: "Developers building agents", planned: ["Tool calling", "Planning and memory", "Multi-agent patterns", "Safety and evals"] },
];

export const findStack = (slug: string | undefined) => stacks.find((s) => s.slug === slug);
