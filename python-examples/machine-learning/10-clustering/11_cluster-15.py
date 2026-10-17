# -*- coding: utf-8 -*-
# ==========================================================================
# MiniBatch and bisecting k-means [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# MiniBatch k-means updates the centres from small random batches instead of
# the whole dataset — faster, slightly worse. It keeps a running mean: μ_new =
# (n·μ_old + Σ new points) / (n + batch count). A centre summarising 4 orders
# with mean 5 (sum 20) receives a batch of 7 and 9 (sum 16): (20 + 16)/(4 + 2)
# = 6. Bisecting k-means is top-down: start with all points, split one group
# into two with k-means, choose a group to split next, stop at the requested
# leaf count. For stops [1, 2, 3, 8, 9, 10] the first split gives {1,2,3} and
# {8,9,10}, means 2 and 9, SSE 2 each.
#
# WHERE YOU USE IT
# A bisecting split tree records your sequence of splits; its heights are not
# agglomerative dendrogram distances. Both methods still need K and scaling.
#
# RUN IT:  python 11_cluster-15.py
#

import numpy as np

n, mu, batch_sum, batch_n = 4, 5.0, 16.0, 2
print((n * mu + batch_sum) / (n + batch_n))
x = np.array([1, 2, 3, 8, 9, 10], dtype=float)
left, right = x[x < 5], x[x >= 5]
print(left.mean(), right.mean(), float(((left - left.mean()) ** 2).sum()), float(((right - right.mean()) ** 2).sum()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 6.0
# 2.0 9.0 2.0 2.0
