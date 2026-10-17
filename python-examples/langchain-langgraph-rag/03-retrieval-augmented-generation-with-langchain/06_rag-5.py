# -*- coding: utf-8 -*-
# ==========================================================================
# MMR: relevant but not redundant [langchain-langgraph-rag /
# Retrieval-augmented generation with LangChain]
# ==========================================================================
# WHAT IT IS
# Plain top-k often returns near-duplicates (overlapping chunks, repeated
# pages), wasting context. Maximal marginal relevance (MMR) picks results one
# at a time by score = λ·sim(doc, query) − (1 − λ)·max sim(doc, already
# chosen): relevance minus redundancy. λ = 1 is plain similarity; lower λ
# favours diversity. In the example the first pick is the most relevant
# document; the second document is almost a copy of it (cosine 0.99), so MMR
# skips it in favour of a slightly less relevant but different one. Vector
# stores that support it expose an MMR search option; typical settings fetch a
# larger candidate pool (say 20) and keep k = 4 from it.
#
# WHERE YOU USE IT
# Use MMR when your corpus contains repeated or overlapping text; keep λ high
# (0.7–0.9) so relevance still dominates.
#
# RUN IT:  python 06_rag-5.py
#

import numpy as np

q = np.array([1.0, 0.0, 0.0])
docs = np.array([[0.95, 0.31, 0.0], [0.94, 0.30, 0.15], [0.80, -0.55, 0.24], [0.5, 0.2, 0.84]])
docs = docs / np.linalg.norm(docs, axis=1, keepdims=True)
sim = docs @ q
def mmr(lam, k=3):
    chosen = [int(np.argmax(sim))]
    while len(chosen) < k:
        scores = {i: lam * sim[i] - (1 - lam) * max(docs[i] @ docs[j] for j in chosen) for i in range(len(docs)) if i not in chosen}
        chosen.append(max(scores, key=scores.get))
    return chosen
print(sim.round(3).tolist(), round(float(docs[0] @ docs[1]), 3))
print(mmr(1.0), mmr(0.5))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.951, 0.942, 0.8, 0.501] 0.989
# [0, 1, 2] [0, 2, 3]
