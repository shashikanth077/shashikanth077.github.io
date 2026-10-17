# -*- coding: utf-8 -*-
# ==========================================================================
# Hybrid search and reranking [generative-ai / Retrieval-augmented generation]
# ==========================================================================
# WHAT IT IS
# Dense embeddings find meaning ("car" ≈ "automobile") but can miss exact
# terms, codes and names; keyword search (BM25) is the opposite. Hybrid search
# runs both and merges the lists, commonly with reciprocal rank fusion: score
# = Σ 1/(60 + rank). Dense ranking A, B, C and keyword ranking B, C, A: A gets
# 1/61 + 1/63 = 0.0323, B gets 1/62 + 1/61 = 0.0325, C gets 1/63 + 1/62 =
# 0.0320 → B first. A reranker (a cross-encoder that reads the question and
# each candidate together) then re-scores the top 20–50 candidates accurately;
# it is slower per pair but only runs on few. The cascade — cheap recall
# first, expensive precision second — is standard.
#
# WHERE YOU USE IT
# Rerankers often give the largest single quality jump in a RAG system.
#
# RUN IT:  python 04_rag-3.py
#

dense = ["A", "B", "C"]
keyword = ["B", "C", "A"]
score = {}
for ranking in (dense, keyword):
    for rank, doc in enumerate(ranking, 1):
        score[doc] = score.get(doc, 0) + 1 / (60 + rank)
print({k: round(v, 4) for k, v in score.items()}, max(score, key=score.get))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'A': 0.0323, 'B': 0.0325, 'C': 0.032} B
