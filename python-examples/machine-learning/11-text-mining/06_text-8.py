# -*- coding: utf-8 -*-
# ==========================================================================
# Information retrieval: a tiny search engine [machine-learning / Text mining]
# ==========================================================================
# WHAT IT IS
# Return useful documents before trying to generate an answer: transform the
# query with the SAME vocabulary, compare it with the document vectors, rank,
# and show the source text. In the toy corpus the query "refund" scores D1 and
# D2 equally (0.6053 each) and D3 zero; "payment" retrieves D1 first (0.7960);
# a query with no vocabulary overlap returns no positive score instead of
# pretending it found evidence. Evaluate with precision@k = relevant retrieved
# / k and recall@k = relevant retrieved / all relevant: with 4 relevant pages
# and 2 among the top 3, precision@3 = 2/3 and recall@3 = 2/4 = 0.5. Choose
# the query below.
#
# WHERE YOU USE IT
# Beyond this lab: BM25 for lexical retrieval, embeddings for semantic
# retrieval, hybrid retrieval and rerankers. Good ranking cannot compensate
# for missing or outdated sources, and you must search only what the user may
# access.
#
# RUN IT:  python 06_text-8.py
#

import numpy as np

vocab = ["refund", "payment", "charge", "delivery"]
docs = np.array([[0.6053, 0.7960, 0, 0], [0.6053, 0, 0.7960, 0], [0, 0, 0, 1.0]])
for query in ("refund", "payment", "delivery", "parcel"):
    q = np.array([1.0 if w == query else 0.0 for w in vocab])
    scores = docs @ q
    print(query, scores.round(4).tolist(), (scores.argsort()[::-1] + 1).tolist() if scores.max() > 0 else "no match")
print(round(2 / 3, 3), 2 / 4)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# refund [0.6053, 0.6053, 0.0] [2, 1, 3]
# payment [0.796, 0.0, 0.0] [1, 3, 2]
# delivery [0.0, 0.0, 1.0] [3, 2, 1]
# parcel [0.0, 0.0, 0.0] no match
# 0.667 0.5
