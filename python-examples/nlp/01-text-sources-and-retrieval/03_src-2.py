# -*- coding: utf-8 -*-
# ==========================================================================
# Information retrieval: the inverted index [nlp / Text sources and retrieval]
# ==========================================================================
# WHAT IT IS
# Searching every document for every query is slow. An inverted index stores,
# for each term, the list of documents that contain it (a postings list), so a
# query only touches the lists of its own words. Four toy documents: "cat" →
# [1], "on" → [1, 2], "mat" → [1]. A query "cat on mat" fetches those three
# lists and scores the documents that appear in them; documents 3 and 4 are
# never touched. A Boolean AND is the intersection of lists, OR the union.
#
# WHERE YOU USE IT
# Search engines add positions (for phrases), compression and sharding, but
# the core structure is exactly this dictionary.
#
# RUN IT:  python 03_src-2.py
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
index = {}
for i, t in enumerate(toks, 1):
    for w in set(t):
        index.setdefault(w, []).append(i)
for w in ("cat", "on", "mat", "the"):
    print(w, index[w])
print(sorted(set(index["cat"]) | set(index["on"]) | set(index["mat"])), sorted(set(index["on"]) & set(index["the"])))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# cat [1]
# on [1, 2]
# mat [1]
# the [1, 2, 4]
# [1, 2] [1, 2]
