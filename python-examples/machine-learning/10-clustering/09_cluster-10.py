# -*- coding: utf-8 -*-
# ==========================================================================
# DBSCAN calculations: count, then expand [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# With ε = 1.5 km and min_samples = 3, count each point's neighbours (itself
# included): A, B: {A,B,C} = 3, core. C: {A,B,C,H} = 4, core (d(C,H) = 0.8).
# D, E, F: 3 each, core. G: only itself = 1, noise (its nearest point is H at
# 2.2 km). H: {C, H} = 2, so not core — but C is core and 0.8 away, so H is a
# border point (d(A,H) = 1.8 and d(B,H) ≈ 2.059 are outside ε). Expanding from
# core A reaches B, C, then H joins as a border and cannot expand further; D
# starts a second cluster. Result: {A, B, C, H}, {D, E, F}, noise {G}.
#
# WHERE YOU USE IT
# min_samples is a local density test, not a desired cluster size. A noise
# point later found within ε of a core point becomes a border point. In
# scikit-learn noise is −1 and the point counts toward min_samples.
#
# RUN IT:  python 09_cluster-10.py
#

import numpy as np

X = np.array([[1, 1], [1, 2], [2, 1], [8, 8], [8, 9], [9, 8], [5, 1], [2.8, 1]])
eps, min_samples = 1.5, 3
D = np.sqrt(((X[:, None] - X[None]) ** 2).sum(2))
neighbours = [np.flatnonzero(D[i] <= eps) for i in range(len(X))]
core = [len(n) >= min_samples for n in neighbours]
print([len(n) for n in neighbours], core)
labels = np.full(len(X), -1)
cluster = 0
for i in range(len(X)):
    if labels[i] != -1 or not core[i]:
        continue
    stack = [i]
    labels[i] = cluster
    while stack:
        p = stack.pop()
        if core[p]:
            for q in neighbours[p]:
                if labels[q] == -1:
                    labels[q] = cluster
                    stack.append(q)
    cluster += 1
print(labels.tolist(), float(np.mean(labels == -1)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [3, 3, 4, 3, 3, 3, 1, 2] [True, True, True, True, True, True, False, False]
# [0, 0, 0, 1, 1, 1, -1, 0] 0.125
