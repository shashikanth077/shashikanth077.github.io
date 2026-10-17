# -*- coding: utf-8 -*-
# ==========================================================================
# Bag of words: counting what is there [nlp / Text representations]
# ==========================================================================
# WHAT IT IS
# The simplest representation counts each vocabulary word in a document and
# forgets the order. "the cat sat on the mat" becomes a vector with the = 2
# and cat = sat = on = mat = 1. It is fast and works surprisingly well for
# topic classification and spam filtering, but it cannot tell "dog bites man"
# from "man bites dog", treats "good" and "great" as unrelated, and the
# vectors are long and mostly zero (sparse).
#
# WHERE YOU USE IT
# A sparse matrix (SciPy / scikit-learn) stores only the non-zero counts;
# always keep text features sparse.
#
# RUN IT:  python 01_repr-0.py
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
def bow(t):
    c = Counter(t)
    return [c[w] for w in vocab]

print(vocab)
print(bow(toks[0]))
print(sorted(toks[0]) == sorted("mat the on sat cat the".split()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['and', 'are', 'cat', 'cats', 'dog', 'dogs', 'fell', 'log', 'market', 'mat', 'on', 'pets', 'sat', 'sharply', 'stock', 'the']
# [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 2]
# True
