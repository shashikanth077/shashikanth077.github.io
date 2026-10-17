# -*- coding: utf-8 -*-
# ==========================================================================
# SMOTE: a point between two minority neighbours [machine-learning / Preparing
# data]
# ==========================================================================
# WHAT IT IS
# SMOTE creates a synthetic minority example by interpolation: pick a minority
# point A and a nearby minority neighbour B, then x_new = A + λ(B − A) with 0
# ≤ λ ≤ 1. For A = (1, 2), B = (5, 6): B − A = (4, 4); with λ = 0.25 the new
# point is (1, 2) + 0.25 × (4, 4) = (2, 3). Drag λ: the new point slides along
# the line from A to B.
#
# WHERE YOU USE IT
# Do it only on the training fold. Vanilla SMOTE can create impossible
# fractional category values, and a synthetic text vector is not a readable
# message.
#
# RUN IT:  python 06_prep-6.py
#

import numpy as np

A = np.array([1.0, 2.0])
B = np.array([5.0, 6.0])
print((B - A).tolist(), (A + 0.25 * (B - A)).tolist())
A2, B2 = np.array([2, 4]), np.array([6, 8])
print((A2 + 0.5 * (B2 - A2)).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [4.0, 4.0] [2.0, 3.0]
# [4.0, 6.0]
