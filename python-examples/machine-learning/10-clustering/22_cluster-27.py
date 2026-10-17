# -*- coding: utf-8 -*-
# ==========================================================================
# Evaluating clusters without fooling yourself [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# A good score is evidence, not the business answer. Internal measures use
# only the data: silhouette (higher is better), Davies–Bouldin (lower),
# Calinski–Harabasz (higher), and inertia at a fixed K. Stability: do similar
# groups appear after changing seeds or resampling? Cluster numbers are
# arbitrary: labels [0, 0, 1, 1] and [7, 7, 3, 3] are the same partition, so
# compare co-membership or use the adjusted Rand index. With trusted external
# labels, ARI = (I − E)/(M − E): true grouping {A,B}/{C,D} against predicted
# {A,C}/{B,D} gives I = 0, E = 2/3, M = 2, ARI = −0.5; a perfect match up to
# relabelling gives 1. Finally, business validity: are the groups usable?
#
# WHERE YOU USE IT
# For DBSCAN/HDBSCAN report noise separately — silhouette over only the
# retained points can mislead. Never tune on external test labels, and learn
# any cluster-to-class mapping on training data.
#
# RUN IT:  python 22_cluster-27.py
#

from math import comb
import numpy as np

true, pred = [0, 0, 1, 1], [0, 1, 0, 1]
cont = np.zeros((2, 2), dtype=int)
for t, p in zip(true, pred):
    cont[t, p] += 1
I = sum(comb(int(v), 2) for v in cont.ravel())
a, b = cont.sum(axis=1), cont.sum(axis=0)
E = sum(comb(int(v), 2) for v in a) * sum(comb(int(v), 2) for v in b) / comb(4, 2)
M = (sum(comb(int(v), 2) for v in a) + sum(comb(int(v), 2) for v in b)) / 2
print(I, round(E, 4), M, round((I - E) / (M - E), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0 0.6667 2.0 -0.5
