# -*- coding: utf-8 -*-
# ==========================================================================
# Evaluating and debugging a RAG system [langchain-langgraph-rag /
# Retrieval-augmented generation with LangChain]
# ==========================================================================
# WHAT IT IS
# Measure the two halves separately. Retrieval: for questions with known
# relevant chunks compute recall@k (is a relevant chunk in the top k?) and MRR
# (1/rank of the first relevant one). Generation: faithfulness (is every claim
# supported by the retrieved text), relevance (does it answer the question)
# and correctness against reference answers; include unanswerable questions,
# where the right answer is "not in the sources". Debug by reading failures
# end to end: print the question, the rewritten query, the retrieved chunks
# with scores and the final prompt. Typical fixes: better chunking, metadata
# filters, hybrid keyword + vector search, a reranker, fewer but better
# chunks, a stronger instruction to abstain. Tracing tools (for example
# LangSmith) record these steps for you.
#
# WHERE YOU USE IT
# Keep a regression set of past failures and rerun it on every change of
# splitter, embedding model, index or prompt.
#
# RUN IT:  python 07_rag-6.py
#

cases = [
    {"relevant": {"c1"}, "retrieved": ["c1", "c7", "c9"]},
    {"relevant": {"c4"}, "retrieved": ["c2", "c4", "c8"]},
    {"relevant": {"c5"}, "retrieved": ["c3", "c6", "c9"]},
]
k = 2
recall = sum(bool(c["relevant"] & set(c["retrieved"][:k])) for c in cases) / len(cases)
def rr(c):
    for i, r in enumerate(c["retrieved"], 1):
        if r in c["relevant"]:
            return 1 / i
    return 0.0
print(round(recall, 3), round(sum(rr(c) for c in cases) / len(cases), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.667 0.5
