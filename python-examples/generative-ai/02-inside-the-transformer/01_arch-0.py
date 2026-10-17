# -*- coding: utf-8 -*-
# ==========================================================================
# Self-attention, step by step [generative-ai / Inside the transformer]
# ==========================================================================
# WHAT IT IS
# For each token the model forms a query q, key k and value v (linear
# projections of its embedding). The score between tokens i and j is qᵢ·kⱼ/√d;
# a softmax over j gives attention weights; the output of token i is the
# weighted sum of the values. With three tokens x = (1,0), (0,1), (1,1) and
# identity projections: scores for token 1 are (0.707, 0, 0.707), weights
# (0.401, 0.198, 0.401), output 0.401·(1,0) + 0.198·(0,1) + 0.401·(1,1) =
# (0.802, 0.599). Each token's new vector is a blend of the others, weighted
# by relevance — that is how context flows.
#
# WHERE YOU USE IT
# The 1/√d keeps scores from growing with the dimension, which would saturate
# the softmax.
#
# RUN IT:  python 01_arch-0.py
#

import numpy as np

X = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]])
d = X.shape[1]
def softmax(z):
    e = np.exp(z - z.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)
scores = X @ X.T / np.sqrt(d)
W = softmax(scores)
print(scores.round(3).tolist())
print(W.round(3).tolist())
print((W @ X).round(3).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[0.707, 0.0, 0.707], [0.0, 0.707, 0.707], [0.707, 0.707, 1.414]]
# [[0.401, 0.198, 0.401], [0.198, 0.401, 0.401], [0.248, 0.248, 0.503]]
# [[0.802, 0.599], [0.599, 0.802], [0.752, 0.752]]
