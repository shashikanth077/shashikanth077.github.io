# -*- coding: utf-8 -*-
# ==========================================================================
# Cosine similarity: do two messages point the same way? [machine-learning /
# Text mining]
# ==========================================================================
# WHAT IT IS
# cos(x, y) = (x · y) / (‖x‖ ‖y‖) compares content and reduces the effect of
# document length. For counts D1 = [1, 1, 0, 0] and D2 = [1, 0, 1, 0]: dot
# product 1, both lengths √2, similarity 1/2 = 0.5. D1 and D3 = [0, 0, 0, 1]:
# dot product 0 → similarity 0. For the normalised TF–IDF vector of D1 and the
# query "refund" = [1, 0, 0, 0] the similarity is just the dot product,
# 0.6053; D2 ties; D3 scores 0. For non-negative counts or TF–IDF cosine lies
# between 0 and 1. A zero vector has no direction: handle it separately.
#
# WHERE YOU USE IT
# Similarity is not correctness: two near-identical messages can have opposite
# meanings if "not" is added.
#
# RUN IT:  python 05_text-7.py
#

import numpy as np

cos = lambda a, b: float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
D1, D2, D3 = np.array([1, 1, 0, 0]), np.array([1, 0, 1, 0]), np.array([0, 0, 0, 1])
print(round(cos(D1, D2), 2), cos(D1, D3))
d1 = np.array([np.log(4 / 3) + 1, np.log(4 / 2) + 1, 0, 0])
d1 = d1 / np.linalg.norm(d1)
print(round(float(d1 @ np.array([1, 0, 0, 0])), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.5 0.0
# 0.6053
