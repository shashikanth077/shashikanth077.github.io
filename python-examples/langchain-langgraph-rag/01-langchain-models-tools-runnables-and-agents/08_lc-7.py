# -*- coding: utf-8 -*-
# ==========================================================================
# When to use LangChain — and when not to [langchain-langgraph-rag /
# LangChain: models, tools, runnables and agents]
# ==========================================================================
# WHAT IT IS
# Use it when you want provider and store portability (swap models, embedding
# models and vector stores behind one interface), ready-made pieces
# (splitters, retrievers, agents, middleware), tracing and evaluation tooling
# in the same ecosystem, and LangGraph's persistence and human-in-the-loop for
# long-running agents. Skip or minimise it for a single model call, a tiny
# script, or when the abstraction hides detail you need (exact request fields,
# a provider feature such as prompt caching). Pin versions — the API has
# changed across major releases, so tutorials older than the current docs may
# not run. Whatever you choose, keep your prompts, tools and evaluation set
# independent of the framework.
#
# WHERE YOU USE IT
# Read the framework's source for the pieces you rely on: when something
# misbehaves you will end up there.
#
# RUN IT:  python 08_lc-7.py
#

checks = {
    "one model call, no tools": "call the provider SDK directly",
    "swap providers or vector stores often": "LangChain integrations",
    "long-running, stateful, human-in-the-loop agent": "LangGraph",
    "need a provider-specific feature (caching, batch)": "provider SDK behind your own interface",
}
for need, choice in checks.items():
    print(f"{need:50s} -> {choice}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# one model call, no tools                           -> call the provider SDK directly
# swap providers or vector stores often              -> LangChain integrations
# long-running, stateful, human-in-the-loop agent    -> LangGraph
# need a provider-specific feature (caching, batch)  -> provider SDK behind your own interface
