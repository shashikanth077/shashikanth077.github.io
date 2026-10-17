# -*- coding: utf-8 -*-
# ==========================================================================
# What clustering does [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# A delivery company has customer locations but no predefined zones.
# Clustering puts observations into groups using a chosen idea of similarity —
# no target label is required. A row is a customer; its features are east and
# north coordinates in km. Cluster numbers are arbitrary (cluster 0 is not
# "better" than cluster 1) and a group gets a business meaning only after
# inspection. Clustering is not classification (known labels) and not
# regression (a numeric target).
#
# WHERE YOU USE IT
# All examples are invented. A centroid is a mathematical location; a real
# pickup station also needs road access, capacity and permission. Clustering
# alone does not solve routing.
#
# RUN IT:  python 01_cluster-0.py
#

import numpy as np

P = {"A": (1, 1), "B": (1, 2), "C": (2, 1), "D": (8, 8), "E": (8, 9), "F": (9, 8)}
names = list(P)
xy = np.array(list(P.values()), dtype=float)
D = np.sqrt(((xy[:, None] - xy[None]) ** 2).sum(2))
np.fill_diagonal(D, np.inf)
for i, n in enumerate(names):
    print(n, "->", names[int(D[i].argmin())], round(float(D[i].min()), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# A -> B 1.0
# B -> A 1.0
# C -> A 1.0
# D -> E 1.0
# E -> D 1.0
# F -> D 1.0
