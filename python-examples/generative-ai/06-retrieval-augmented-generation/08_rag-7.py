# -*- coding: utf-8 -*-
# ==========================================================================
# When RAG fails [generative-ai / Retrieval-augmented generation]
# ==========================================================================
# WHAT IT IS
# Common failures and fixes. Right chunk not retrieved: poor chunking,
# vocabulary mismatch → better chunks, hybrid search, query rewriting,
# reranking. Right chunk retrieved, wrong answer: too much noise or
# conflicting sources → fewer, better chunks; ask for citations; lower
# temperature. Answer from memory instead of sources: weak instructions → "use
# only the sources; say 'not found'". Multi-hop questions (the answer needs
# two documents) → iterative retrieval or agentic search. Stale or
# contradictory documents → dates, versioning, deduplication. Log queries,
# retrieved chunks and answers so failures can be diagnosed.
#
# WHERE YOU USE IT
# The fastest improvement loop: collect failed questions, label what should
# have been retrieved, and fix the stage that broke.
#
# RUN IT:  python 08_rag-7.py
#

failures = [("not retrieved", "better chunks, hybrid search, rewrite query"), ("noise in context", "fewer chunks, reranker"), ("ignored sources", "stronger instruction, citations required")]
for cause, fix in failures:
    print(f"{cause:18s} -> {fix}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# not retrieved      -> better chunks, hybrid search, rewrite query
# noise in context   -> fewer chunks, reranker
# ignored sources    -> stronger instruction, citations required
