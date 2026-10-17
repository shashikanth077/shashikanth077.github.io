# -*- coding: utf-8 -*-
# ==========================================================================
# One-hot or integer labels, and why losses want logits [neural-networks /
# Loss functions]
# ==========================================================================
# WHAT IT IS
# A digit label can be stored as an integer (2) or one-hot
# ([0,0,1,0,0,0,0,0,0,0]). Categorical cross-entropy takes one-hot targets;
# sparse categorical cross-entropy takes the integer and computes the same
# loss without building the vector. For true digit 7 and p₇ = 0.8 both give
# −ln 0.8 = 0.2231. Libraries prefer logits because computing log(softmax(z))
# directly overflows for large scores: with logits (1000, 999) a naive softmax
# gives NaN, while subtracting the maximum first gives the correct 0.731 /
# 0.269.
#
# WHERE YOU USE IT
# Pass raw logits to the stable loss functions (from_logits=True in Keras) and
# do not apply softmax yourself first.
#
# RUN IT:  python 05_loss-4.py
#

import numpy as np

p = np.full(10, 0.2 / 9)
p[7] = 0.8
one_hot = np.eye(10)[7]
print(round(float(-(one_hot * np.log(p)).sum()), 4), round(float(-np.log(p[7])), 4))
z = np.array([1000.0, 999.0])
with np.errstate(all="ignore"):
    naive = np.exp(z) / np.exp(z).sum()
stable = np.exp(z - z.max()) / np.exp(z - z.max()).sum()
print(naive.tolist(), stable.round(3).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.2231 0.2231
# [nan, nan] [0.731, 0.269]
