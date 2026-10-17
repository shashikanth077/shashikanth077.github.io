# -*- coding: utf-8 -*-
# ==========================================================================
# Hierarchical clustering: build a tree [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# Four stops lie on a road at 1, 2, 7 and 10 km (P, Q, R, S). Agglomerative
# clustering starts with one cluster per point and repeatedly merges the two
# closest clusters. With single linkage the distance between clusters is the
# minimum distance between their members: the closest pair is P, Q (1), then
# R, S (3), then {P,Q} with {R,S} at min(6, 9, 5, 8) = 5. The tree records
# every merge; you can cut it afterwards instead of fixing the number of
# groups up front. Early merges are never undone. (Divisive clustering works
# top-down instead.)
#
# WHERE YOU USE IT
# Full distance matrices and trees get expensive as the number of rows grows.
#
# RUN IT:  python 06_cluster-6.py
#

import numpy as np

x = np.array([1.0, 2.0, 7.0, 10.0])
clusters = [[0], [1], [2], [3]]
D = np.abs(x[:, None] - x[None])
while len(clusters) > 1:
    best = None
    for i in range(len(clusters)):
        for j in range(i + 1, len(clusters)):
            d = min(D[a, b] for a in clusters[i] for b in clusters[j])
            if best is None or d < best[0]:
                best = (d, i, j)
    d, i, j = best
    print([x[a].tolist() for a in clusters[i]], [x[b].tolist() for b in clusters[j]], float(d))
    clusters[i] = clusters[i] + clusters[j]
    del clusters[j]

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [1.0] [2.0] 1.0
# [7.0] [10.0] 3.0
# [1.0, 2.0] [7.0, 10.0] 5.0
