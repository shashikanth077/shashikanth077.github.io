# -*- coding: utf-8 -*-
# ==========================================================================
# Choosing K: the elbow [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# SSE always falls as K grows — K = n makes every point its own cluster with
# SSE 0 — so the smallest SSE cannot choose K. Look for the elbow: the K after
# which extra clusters give only small improvements. For the six locations the
# best SSE is 149.667 for K = 1 and 2.667 for K = 2, then 1.833, 1.0, 0.5 and
# 0 — a sharp bend at K = 2. Real data may show no clear elbow. Drag K.
#
# WHERE YOU USE IT
# Combine the elbow with silhouette scores, stability across random seeds,
# cluster sizes and business usefulness.
#
# RUN IT:  python 04_cluster-4.py
#

import numpy as np
from itertools import combinations

X = np.array([[1, 1], [1, 2], [2, 1], [8, 8], [8, 9], [9, 8]], dtype=float)

def lloyd(c):
    for _ in range(50):
        d2 = ((X[:, None] - c[None]) ** 2).sum(2)
        a = d2.argmin(1)
        new = np.array([X[a == j].mean(axis=0) if (a == j).any() else c[j] for j in range(len(c))])
        if np.allclose(new, c):
            break
        c = new
    return float(((X[:, None] - c[None]) ** 2).sum(2).min(1).sum())

best = [min(lloyd(X[list(i)].copy()) for i in combinations(range(6), k)) for k in range(1, 7)]
print([round(v, 3) for v in best])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [149.667, 2.667, 1.833, 1.0, 0.5, 0.0]
