# -*- coding: utf-8 -*-
# ==========================================================================
# Attention: dot products, softmax and √d [maths-ai / Putting it together:
# networks]
# ==========================================================================
# WHAT IT IS
# Attention lets a token look at all others. Compare the query with every key
# by dot product, divide by √d to keep the numbers tame, turn the scores into
# weights with softmax, and use those weights to mix the values. The weights
# are non-negative and sum to 1 — a weighted average of what to focus on.
#
# WHERE YOU USE IT
# This is the core of every Transformer and large language model.
#
# RUN IT:  python 09_nn-8.py
#

import math
q = [2, 1]
keys = [[1, 0], [0, 1], [1, 1]]
d = len(q)
scores = [sum(a * b for a, b in zip(q, k)) / math.sqrt(d) for k in keys]
exps = [math.exp(s) for s in scores]
weights = [e / sum(exps) for e in exps]
print([round(w, 3) for w in weights])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.284, 0.14, 0.576]
