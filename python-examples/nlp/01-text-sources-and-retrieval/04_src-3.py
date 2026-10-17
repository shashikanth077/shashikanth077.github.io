# -*- coding: utf-8 -*-
# ==========================================================================
# TF-IDF: weigh words by how special they are [nlp / Text sources and
# retrieval]
# ==========================================================================
# WHAT IT IS
# A word is informative if it is frequent in this document but rare across the
# collection. tf = count in the document ÷ its length; idf = ln(N / df) where
# df is the number of documents containing the word. With N = 4: idf("the") =
# ln(4/3) = 0.288, idf("on") = ln(4/2) = 0.693, idf("cat") = idf("mat") =
# ln(4/1) = 1.386. The weight is tf × idf: rare words get large weights,
# ubiquitous ones almost none. Variants (smoothing, log-scaled tf) change the
# numbers but not the idea.
#
# WHERE YOU USE IT
# Without idf, stop words like "the" would dominate every comparison.
#
# RUN IT:  python 04_src-3.py
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
for w in ("the", "on", "cat", "mat", "sat"):
    print(w, df[w], round(idf[w], 3))
tf = Counter(toks[0])
print({w: round(tf[w] / len(toks[0]) * idf[w], 3) for w in ("the", "cat", "sat", "on", "mat")})

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# the 3 0.288
# on 2 0.693
# cat 1 1.386
# mat 1 1.386
# sat 2 0.693
# {'the': 0.096, 'cat': 0.231, 'sat': 0.116, 'on': 0.116, 'mat': 0.231}
