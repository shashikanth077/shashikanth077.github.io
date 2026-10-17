# -*- coding: utf-8 -*-
# ==========================================================================
# BM25: the ranking function behind most search [nlp / Text sources and
# retrieval]
# ==========================================================================
# WHAT IT IS
# BM25 refines TF-IDF with two fixes: term-frequency saturation (the tenth
# occurrence matters less than the second) and length normalisation. Per query
# word: idf × f(k₁+1) / (f + k₁(1 − b + b·|d|/avgdl)), typically k₁ = 1.5, b =
# 0.75, summed over the query. On the toy collection the scores for "cat on
# mat" are 2.979, 0.666, 0, 0 — same order as cosine, but with a principled
# handling of repeated words. Drag f to see the saturation curve: it flattens
# towards k₁ + 1.
#
# WHERE YOU USE IT
# BM25 remains a very strong baseline; hybrid search combines it with dense
# embeddings.
#
# RUN IT:  python 06_src-5.py
#

import math
from collections import Counter

import numpy as np

docs = ["the cat sat on the mat", "the dog sat on the log", "cats and dogs are pets", "the stock market fell sharply"]
toks = [d.split() for d in docs]
vocab = sorted({w for t in toks for w in t})
N = len(docs)
df = {w: sum(w in t for t in toks) for w in vocab}
idf = {w: math.log(N / df[w]) for w in vocab}
def bm25(q, t, k1=1.5, b=0.75):
    avg = np.mean([len(x) for x in toks])
    s = 0.0
    for w in q:
        f = t.count(w)
        idw = math.log((N - df.get(w, 0) + 0.5) / (df.get(w, 0) + 0.5) + 1)
        s += idw * f * (k1 + 1) / (f + k1 * (1 - b + b * len(t) / avg))
    return s

print([round(float(bm25(["cat", "on", "mat"], t)), 3) for t in toks])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [2.979, 0.666, 0.0, 0.0]
