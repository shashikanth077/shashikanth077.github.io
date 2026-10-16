import { buildStack } from "../author/build.js";
import { lc } from "../author/langchain/core.js";
import { lg, prod } from "../author/langchain/graph.js";
import { codeLab, drills, glance, lists, materials, questions } from "../author/langchain/practice.js";
import { rag } from "../author/langchain/rag.js";
import { vec } from "../author/langchain/vectors.js";
import outputs from "./langchain-langgraph-rag.outputs.json";

/**
 * LangChain, LangGraph and Vector Databases — hand-authored. The packages are not installed
 * here, so every example runs a tiny stand-in that mirrors the real interface (Document,
 * VectorStore, Runnable, StateGraph, checkpointer, interrupt); the "Output" panels come from
 * RUNNING that code:  npm run outputs -- langchain-langgraph-rag
 * Real API names were checked against the official documentation on 2026-10-16.
 */
const built = buildStack({
  areas: [
    ["lc", "LangChain: models, tools, runnables and agents", "LangChain"],
    ["vec", "Vector databases and indexes", "Vector DBs"],
    ["rag", "Retrieval-augmented generation with LangChain", "RAG"],
    ["lg", "LangGraph: stateful graphs, memory and human-in-the-loop", "LangGraph"],
    ["prod", "Testing, tracing and operating", "In production"],
  ],
  concepts: { lc, vec, rag, lg, prod },
  questions,
  drills,
  codeLab,
  glance,
  lists,
  materials,
  outputs: outputs as Record<string, string>,
});

export const content = built.content;
export const visuals = built.visuals;
