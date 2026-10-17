# -*- coding: utf-8 -*-
# ==========================================================================
# Evaluating retrieval: precision, recall and rank metrics [nlp / Text sources
# and retrieval]
# ==========================================================================
# WHAT IT IS
# Given a ranked list and known relevant documents, precision@k is the
# fraction of the top k that are relevant and recall@k the fraction of all
# relevant ones found. Ranking-aware: reciprocal rank = 1 / rank of the first
# relevant and, averaged over queries, MRR. Example: results [R, N, R, N, N]
# with 3 relevant documents in total: precision@3 = 2/3, recall@3 = 2/3,
# reciprocal rank = 1. If the first relevant result were at rank 4, the
# reciprocal rank would be 0.25.
#
# WHERE YOU USE IT
# Choose k by how many results a user actually reads; MRR suits "find the one
# answer" tasks.
#
# RUN IT:  python 07_src-6.py
#

ranked = ["R", "N", "R", "N", "N"]
total_relevant = 3
k = 3
hits = ranked[:k].count("R")
print(round(hits / k, 3), round(hits / total_relevant, 3), 1 / (ranked.index("R") + 1))
print(1 / (["N", "N", "N", "R"].index("R") + 1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.667 0.667 1.0
# 0.25
