import type { StackContent, StackStats } from "./types.js";
import type { VisualMap } from "./visuals/types.js";
import nodeStats from "./content/nodejs.stats.json";
import redisStats from "./content/redis.stats.json";
import pythonAiStats from "./content/python-ai.stats.json";
import mathsAiStats from "./content/maths-ai.stats.json";
import numpyStats from "./content/numpy.stats.json";
import matplotlibStats from "./content/matplotlib.stats.json";
import pandasStats from "./content/pandas.stats.json";
import sklearnStats from "./content/scikit-learn.stats.json";
import mlStats from "./content/machine-learning.stats.json";
import agenticStats from "./content/agentic-ai.stats.json";
import cvStats from "./content/computer-vision.stats.json";
import genaiStats from "./content/generative-ai.stats.json";
import nlpStats from "./content/nlp.stats.json";
import rlStats from "./content/reinforcement-learning.stats.json";
import speechStats from "./content/speech-processing.stats.json";
import nnStats from "./content/neural-networks.stats.json";

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
  {
    slug: "pandas",
    name: "Pandas",
    section: "ai",
    stage: "Foundations",
    icon: "🐼",
    accent: "#6a5acd",
    tagline: "Tables of data, cleaned, joined and ready for models",
    blurb:
      "DataFrames, selecting and filtering, cleaning, group-by, joins, time series and preparing features for machine learning — each step shown on a small table you can watch change.",
    audience: "Learners who finished NumPy, and anyone who works with spreadsheets or CSV files",
    labels: codeStackLabels,
    stats: pandasStats,
    load: () => import("./content/pandas.js").then((m) => m.content),
    loadVisuals: () => import("./content/pandas.js").then((m) => m.visuals),
  },
  {
    slug: "scikit-learn",
    name: "scikit-learn",
    section: "ai",
    stage: "Core machine learning",
    icon: "🧪",
    accent: "#e0832f",
    tagline: "Your first real models: fit, predict, evaluate",
    blurb:
      "The estimator API, train/test splits, scaling and encoding, regression, classification, evaluation, cross-validation, clustering and PCA — each idea as a diagram you can drag, built around leak-free pipelines.",
    audience: "Learners who finished NumPy and pandas, and anyone moving from analysis to modelling",
    labels: codeStackLabels,
    stats: sklearnStats,
    load: () => import("./content/scikit-learn.js").then((m) => m.content),
    loadVisuals: () => import("./content/scikit-learn.js").then((m) => m.visuals),
  },
  {
    slug: "machine-learning",
    name: "Machine Learning",
    section: "ai",
    stage: "Core machine learning",
    icon: "📈",
    accent: "#7c5cff",
    tagline: "From data and statistics to classifiers, clusters and text",
    blurb:
      "Statistics, data preparation, distances, trees and ensembles, Naive Bayes, kNN, SVM, neural networks, evaluation, projections, 25 clustering methods and text mining — every worked calculation as a diagram you can drag and code you can run.",
    audience: "Learners who finished Python, NumPy and the maths track, and students preparing for ML exams or interviews",
    labels: {
      production: "Where it shows up",
      interview: "Exam and interview angle",
      drillsTab: "Work it out",
      drillsIntro: "Short calculations that exams and interviews love. Work each one out first, then open the step-by-step solution.",
      drillQuestion: "What is the answer?",
      drillPath: "Step by step",
      drillFix: "Why",
      drillPrevent: "Watch out",
      drillInterview: "Remember",
      drillDone: "✓ solved",
      codeTab: "Practice problems",
      codeIntro: "Build each idea from scratch in NumPy. Try it yourself first, then compare with the worked solution.",
    },
    stats: mlStats,
    load: () => import("./content/machine-learning.js").then((m) => m.content),
    loadVisuals: () => import("./content/machine-learning.js").then((m) => m.visuals),
  },
  {
    slug: "neural-networks",
    name: "Neural Networks",
    section: "ai",
    stage: "Core machine learning",
    icon: "🕸",
    accent: "#d6489a",
    tagline: "Neurons, backpropagation, regularization, CNNs, RNNs, attention and GANs",
    blurb:
      "One neuron to a whole network: activations, losses, gradient descent and backpropagation by hand, optimisers, overfitting and regularization, evaluation metrics, MNIST, CNNs, RNN/LSTM/GRU, attention, autoencoders, VAEs and GANs — every worked example as a diagram that moves and code that really ran.",
    audience: "Learners who finished Python, NumPy and Machine Learning, and students preparing for neural-network exams",
    labels: {
      production: "Good to know",
      interview: "Exam and interview angle",
      drillsTab: "Work it out",
      drillsIntro: "Short calculations that exams and interviews love. Work each one out first, then open the step-by-step solution.",
      drillQuestion: "What is the answer?",
      drillPath: "Step by step",
      drillFix: "Why",
      drillPrevent: "Watch out",
      drillInterview: "Remember",
      drillDone: "✓ solved",
      codeTab: "Practice problems",
      codeIntro: "Build each idea from scratch in NumPy. Try it yourself first, then compare with the worked solution.",
    },
    stats: nnStats,
    load: () => import("./content/neural-networks.js").then((m) => m.content),
    loadVisuals: () => import("./content/neural-networks.js").then((m) => m.visuals),
  },
  {
    slug: "nlp",
    name: "Natural Language Processing",
    section: "ai",
    stage: "Modern AI",
    icon: "💬",
    accent: "#2f8f6b",
    tagline: "From raw text to search, classifiers, taggers, language models and dialog",
    blurb:
      "Text sources and retrieval, preprocessing and tokenization, bag-of-words, TF-IDF and embeddings, sentiment and text classification, part-of-speech tagging and named entities, sequence labeling, language models, sequence-to-sequence, question answering and dialog systems — every worked example as a diagram that moves and code that really ran.",
    audience: "Learners who finished Python, NumPy, Machine Learning and Neural Networks, and students taking an NLP course",
    labels: {
      production: "In real systems",
      interview: "Exam and interview angle",
      drillsTab: "Work it out",
      drillsIntro: "Short calculations that exams and interviews love. Work each one out first, then open the step-by-step solution.",
      drillQuestion: "What is the answer?",
      drillPath: "Step by step",
      drillFix: "Why",
      drillPrevent: "Watch out",
      drillInterview: "Remember",
      drillDone: "✓ solved",
      codeTab: "Practice problems",
      codeIntro: "Build each idea from scratch in NumPy and plain Python. Try it yourself first, then compare with the worked solution.",
    },
    stats: nlpStats,
    load: () => import("./content/nlp.js").then((m) => m.content),
    loadVisuals: () => import("./content/nlp.js").then((m) => m.visuals),
  },
  {
    slug: "reinforcement-learning",
    name: "Reinforcement Learning",
    section: "ai",
    stage: "Modern AI",
    icon: "🎮",
    accent: "#c2452d",
    tagline: "Agents, rewards, value functions and policies",
    blurb:
      "Bandits and exploration, Markov decision processes, Bellman equations, dynamic programming, Monte Carlo, TD learning, SARSA and Q-learning, deep Q-networks, policy gradients, actor–critic and PPO, models, reward shaping, multi-agent learning and RLHF — every update rule worked by hand, as a diagram that moves and code that really ran.",
    audience: "Learners who finished Python, NumPy and Neural Networks, and students taking a reinforcement-learning course",
    labels: {
      production: "In practice",
      interview: "Exam and interview angle",
      drillsTab: "Work it out",
      drillsIntro: "Short calculations that exams and interviews love. Work each one out first, then open the step-by-step solution.",
      drillQuestion: "What is the answer?",
      drillPath: "Step by step",
      drillFix: "Why",
      drillPrevent: "Watch out",
      drillInterview: "Remember",
      drillDone: "✓ solved",
      codeTab: "Practice problems",
      codeIntro: "Build each idea from scratch in NumPy. Try it yourself first, then compare with the worked solution.",
    },
    stats: rlStats,
    load: () => import("./content/reinforcement-learning.js").then((m) => m.content),
    loadVisuals: () => import("./content/reinforcement-learning.js").then((m) => m.visuals),
  },
  {
    slug: "computer-vision",
    name: "Computer Vision",
    section: "ai",
    stage: "Modern AI",
    icon: "👁",
    accent: "#4a7bd0",
    tagline: "From pixels and filters to detection, segmentation and vision transformers",
    blurb:
      "Images as arrays, histograms and noise, convolution, blur, median and edge filters, thresholding and morphology, geometry and cameras, corners and features, CNN classifiers, object detection with IoU, NMS and mAP, U-Net segmentation, vision transformers, CLIP, optical flow and tracking — every worked calculation as a diagram that moves and code that really ran.",
    audience: "Learners who finished Python, NumPy and Neural Networks, and students taking a computer-vision course",
    labels: {
      production: "In real systems",
      interview: "Exam and interview angle",
      drillsTab: "Work it out",
      drillsIntro: "Short calculations that exams and interviews love. Work each one out first, then open the step-by-step solution.",
      drillQuestion: "What is the answer?",
      drillPath: "Step by step",
      drillFix: "Why",
      drillPrevent: "Watch out",
      drillInterview: "Remember",
      drillDone: "✓ solved",
      codeTab: "Practice problems",
      codeIntro: "Build each idea from scratch in NumPy. Try it yourself first, then compare with the worked solution.",
    },
    stats: cvStats,
    load: () => import("./content/computer-vision.js").then((m) => m.content),
    loadVisuals: () => import("./content/computer-vision.js").then((m) => m.visuals),
  },
  {
    slug: "speech-processing",
    name: "Speech Processing",
    section: "ai",
    stage: "Modern AI",
    icon: "🎙",
    accent: "#8a5fd0",
    tagline: "Audio signals, spectrograms, recognition, synthesis and speakers",
    blurb:
      "Sound and sampling, the Fourier transform and spectrograms, mel features and MFCCs, speech recognition with HMMs, CTC and transformers, word error rate, text-to-speech with vocoders, speaker embeddings, diarization, noise reduction and microphone arrays — every worked calculation as a diagram that moves and code that really ran.",
    audience: "Learners who finished Python, NumPy and Neural Networks, and students taking a speech-processing course",
    labels: {
      production: "In real systems",
      interview: "Exam and interview angle",
      drillsTab: "Work it out",
      drillsIntro: "Short calculations that exams and interviews love. Work each one out first, then open the step-by-step solution.",
      drillQuestion: "What is the answer?",
      drillPath: "Step by step",
      drillFix: "Why",
      drillPrevent: "Watch out",
      drillInterview: "Remember",
      drillDone: "✓ solved",
      codeTab: "Practice problems",
      codeIntro: "Build each idea from scratch in NumPy. Try it yourself first, then compare with the worked solution.",
    },
    stats: speechStats,
    load: () => import("./content/speech-processing.js").then((m) => m.content),
    loadVisuals: () => import("./content/speech-processing.js").then((m) => m.visuals),
  },
  {
    slug: "generative-ai",
    name: "Generative AI",
    section: "ai",
    stage: "Modern AI",
    icon: "✨",
    accent: "#e0841f",
    tagline: "How large models work, and how to build with them",
    blurb:
      "Tokens and embeddings, self-attention and the transformer worked by hand, parameter counts and KV-cache memory, scaling laws, LoRA, quantisation and DPO, prompting and structured outputs, retrieval-augmented generation, diffusion image models, evaluation, cost, latency and safety — every calculation as a diagram that moves and code that really ran.",
    audience: "Developers and learners who finished Python, NumPy and Neural Networks and want to understand and build with LLMs",
    labels: {
      production: "In real systems",
      interview: "Exam and interview angle",
      drillsTab: "Work it out",
      drillsIntro: "Short calculations that exams and interviews love. Work each one out first, then open the step-by-step solution.",
      drillQuestion: "What is the answer?",
      drillPath: "Step by step",
      drillFix: "Why",
      drillPrevent: "Watch out",
      drillInterview: "Remember",
      drillDone: "✓ solved",
      codeTab: "Practice problems",
      codeIntro: "Build each idea from scratch in NumPy. Try it yourself first, then compare with the worked solution.",
    },
    stats: genaiStats,
    load: () => import("./content/generative-ai.js").then((m) => m.content),
    loadVisuals: () => import("./content/generative-ai.js").then((m) => m.visuals),
  },
  {
    slug: "agentic-ai",
    name: "Agentic AI",
    section: "ai",
    stage: "Modern AI",
    icon: "🤖",
    accent: "#18a3a3",
    tagline: "Tools, planning, memory, multi-agent systems and safe control",
    blurb:
      "Agent loops and tool calling, the Model Context Protocol, ReAct, planning and reflection, memory and state, multi-agent patterns, evaluation (task success, pass^k, trajectories), prompt injection, approvals, sandboxes, budgets and durable execution — every calculation as a diagram that moves and a scripted agent you can actually run.",
    audience: "Developers who finished Generative AI and want to build, evaluate and safely ship agents",
    labels: {
      production: "In real systems",
      interview: "Exam and interview angle",
      drillsTab: "Work it out",
      drillsIntro: "Short calculations that exams and interviews love. Work each one out first, then open the step-by-step solution.",
      drillQuestion: "What is the answer?",
      drillPath: "Step by step",
      drillFix: "Why",
      drillPrevent: "Watch out",
      drillInterview: "Remember",
      drillDone: "✓ solved",
      codeTab: "Practice problems",
      codeIntro: "Build each idea from scratch in plain Python. Try it yourself first, then compare with the worked solution.",
    },
    stats: agenticStats,
    load: () => import("./content/agentic-ai.js").then((m) => m.content),
    loadVisuals: () => import("./content/agentic-ai.js").then((m) => m.visuals),
  },
  { slug: "building-with-llms", name: "Building with Claude and GitHub Models", section: "ai", stage: "Modern AI", icon: "🛠", accent: "#d9731a", tagline: "Using Claude and GitHub Models in development and research", blurb: "Calling models from code, prompting, tool use, caching, evaluation, and using them as coding and research assistants.", audience: "Developers and researchers using LLM APIs", planned: ["Claude API", "GitHub Models", "Coding assistants", "Research workflows"] },
];

export const findStack = (slug: string | undefined) => stacks.find((s) => s.slug === slug);
