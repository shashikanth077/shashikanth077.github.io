# -*- coding: utf-8 -*-
# ==========================================================================
# Ranking with cosine similarity [nlp / Text sources and retrieval]
# ==========================================================================
# WHAT IT IS
# Represent the query and each document as TF-IDF vectors and rank by cosine
# similarity = q·d / (‖q‖‖d‖) — the angle between them, so long documents are
# not favoured. For the query "cat on mat" the four documents score 0.918,
# 0.102, 0, 0: document 1 shares all three words (and the rare ones carry the
# weight), document 2 shares only "on", documents 3 and 4 share nothing. Note
# that "cat" does not match "cats": a retrieval system without stemming misses
# it.
#
# WHERE YOU USE IT
# Vector search at scale uses approximate nearest-neighbour indexes; dense
# embeddings replace TF-IDF vectors but the ranking idea is identical.
#
# RUN IT:  python 05_src-4.py
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
def vec(t, scale=True):
    c = Counter(t)
    return np.array([c[w] / len(t) * idf[w] for w in vocab])

q = vec(["cat", "on", "mat"])
for i, t in enumerate(toks, 1):
    v = vec(t)
    print(i, round(float(v @ q / (np.linalg.norm(v) * np.linalg.norm(q) + 1e-12)), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 0.9176
# 2 0.102
# 3 0.0
# 4 0.0
