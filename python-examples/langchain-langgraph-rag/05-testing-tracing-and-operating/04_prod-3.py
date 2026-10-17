# -*- coding: utf-8 -*-
# ==========================================================================
# Choosing: raw loop, LangChain agent or LangGraph [langchain-langgraph-rag /
# Testing, tracing and operating]
# ==========================================================================
# WHAT IT IS
# A practical ladder. One call or a fixed chain: provider SDK or LCEL — keep
# it simple. A tool-using agent with standard behaviour: create_agent, with
# middleware for limits, summarisation and approvals. Custom control flow,
# branching, parallel work, approvals, long-running tasks: LangGraph.
# Retrieval: start with 2-step RAG on a vector store you already operate
# (pgvector is often enough), add query rewriting, grading, a reranker or an
# agentic search tool when evaluation shows a gap. At every rung: write the
# evaluation set first, trace everything, pin framework versions, keep prompts
# and tools outside the framework, and add autonomy only as measured
# reliability earns it.
#
# WHERE YOU USE IT
# The best framework is the smallest one that gives you the control and the
# persistence you actually need.
#
# RUN IT:  python 04_prod-3.py
#

ladder = [
    ("single call / fixed chain", "provider SDK or LCEL"),
    ("tool-using agent, standard loop", "create_agent + middleware"),
    ("branching, approvals, long-running", "LangGraph with a durable checkpointer"),
    ("document Q&A", "2-step RAG on pgvector (or your store); add rewrite/grade/rerank when evaluation says so"),
]
for need, tool in ladder:
    print(f"{need:36s} -> {tool}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# single call / fixed chain            -> provider SDK or LCEL
# tool-using agent, standard loop      -> create_agent + middleware
# branching, approvals, long-running   -> LangGraph with a durable checkpointer
# document Q&A                         -> 2-step RAG on pgvector (or your store); add rewrite/grade/rerank when evaluation says so
