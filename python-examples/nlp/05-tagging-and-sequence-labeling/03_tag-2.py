# -*- coding: utf-8 -*-
# ==========================================================================
# The Viterbi algorithm: the best tag sequence [nlp / Tagging and sequence
# labeling]
# ==========================================================================
# WHAT IT IS
# Trying every tag sequence is exponential (3³ = 27 here, 45ⁿ in general).
# Viterbi is dynamic programming: for every position and tag keep the
# probability of the best path ending there, and a back-pointer. δ₁(s) =
# π(s)·B(s|w₁); δₜ(s) = maxₛ′ δₜ₋₁(s′)·A(s′→s)·B(s|wₜ). For "the dog barks":
# δ₁ = D 0.48; δ₂ = N 0.1728; δ₃ = V 0.0311. Following the pointers back gives
# D N V. Cost: O(n × S²) instead of S^n.
#
# WHERE YOU USE IT
# Work in log space for long sentences to avoid underflow; the same algorithm
# decodes CRFs and speech recognisers.
#
# RUN IT:  python 03_tag-2.py
#

import numpy as np

states = ["D", "N", "V"]
pi = np.array([0.6, 0.3, 0.1])
A = np.array([[0.05, 0.9, 0.05], [0.1, 0.3, 0.6], [0.5, 0.3, 0.2]])
words = ["the", "dog", "barks"]
B = {"D": {"the": 0.8}, "N": {"dog": 0.4, "barks": 0.05}, "V": {"dog": 0.01, "barks": 0.3}}
Bm = np.array([[B[s].get(w, 0.0) for w in words] for s in states])
d = np.zeros((3, 3))
bp = np.zeros((3, 3), int)
d[:, 0] = pi * Bm[:, 0]
for t in range(1, 3):
    for j in range(3):
        c = d[:, t - 1] * A[:, j]
        bp[j, t] = c.argmax()
        d[j, t] = c.max() * Bm[j, t]
path = [int(d[:, -1].argmax())]
for t in (2, 1):
    path.insert(0, int(bp[path[0], t]))
print(d.round(5).tolist())
print([states[i] for i in path])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[0.48, 0.0, 0.0], [0.0, 0.1728, 0.00259], [0.0, 0.00024, 0.0311]]
# ['D', 'N', 'V']
