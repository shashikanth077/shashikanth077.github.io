# -*- coding: utf-8 -*-
# ==========================================================================
# Silhouette: how well separated are the groups? [machine-learning /
# Clustering]
# ==========================================================================
# WHAT IT IS
# For a point i, let a(i) be its mean distance to the other members of its own
# cluster and b(i) the smallest mean distance to another cluster. s(i) = (b −
# a) / max(a, b): near +1 is well separated, near 0 on a boundary, negative
# suggests the point fits another group better. For A: a = (1 + 1)/2 = 1; b =
# (√98 + √113 + √113)/3 ≈ 10.3866; s(A) = 0.9037. The dataset score is the
# mean over all points (0.8853 here). It needs 2 to n − 1 clusters; a
# singleton is scored 0.
#
# WHERE YOU USE IT
# Silhouette favours compact, well-separated clusters and can undervalue valid
# curved density clusters. Inspect sizes, stability and usefulness too.
#
# RUN IT:  python 05_cluster-5.py
#

import numpy as np

X = np.array([[1, 1], [1, 2], [2, 1], [8, 8], [8, 9], [9, 8]], dtype=float)
labels = np.array([0, 0, 0, 1, 1, 1])
D = np.sqrt(((X[:, None] - X[None]) ** 2).sum(2))
s = []
for i in range(6):
    same = [j for j in range(6) if labels[j] == labels[i] and j != i]
    other = [j for j in range(6) if labels[j] != labels[i]]
    a, b = D[i, same].mean(), D[i, other].mean()
    s.append((b - a) / max(a, b))
print(round(float(D[0, [1, 2]].mean()), 4), round(float(D[0, [3, 4, 5]].mean()), 4))
print(np.round(s, 4).tolist(), round(float(np.mean(s)), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.0 10.3866
# [0.9037, 0.8756, 0.8756, 0.8941, 0.8814, 0.8814] 0.8853
