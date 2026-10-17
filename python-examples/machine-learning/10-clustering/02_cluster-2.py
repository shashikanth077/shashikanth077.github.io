# -*- coding: utf-8 -*-
# ==========================================================================
# K-means: assign, average, repeat [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# K is the number of groups you ask for. Choose K and starting centres, then
# repeat: assign every point to its nearest centre (comparing squared
# distances avoids square roots) and replace each centre with the mean of its
# points μⱼ = Σ xᵢ / nⱼ, until assignments stop changing. It minimises the
# within-cluster sum of squared errors J = Σⱼ Σᵢ ‖xᵢ − μⱼ‖² (SSE, "inertia").
# To expose the iteration we start both centres on the left: μ₁ = A = (1, 1),
# μ₂ = C = (2, 1). Step through the states.
#
# WHERE YOU USE IT
# The result depends on the starting centres: use k-means++ and several
# restarts. Convergence does not guarantee the best grouping, and a centre can
# lie between observations.
#
# RUN IT:  python 02_cluster-2.py
#

import numpy as np

X = np.array([[1, 1], [1, 2], [2, 1], [8, 8], [8, 9], [9, 8]], dtype=float)
centres = np.array([[1.0, 1.0], [2.0, 1.0]])
for step in range(5):
    d2 = ((X[:, None] - centres[None]) ** 2).sum(2)
    labels = d2.argmin(1)
    new = np.array([X[labels == j].mean(axis=0) for j in range(2)])
    print(step, labels.tolist(), round(float(d2.min(1).sum()), 3), new.round(3).tolist())
    if np.allclose(new, centres):
        break
    centres = new

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0 [0, 0, 1, 1, 1, 1] 284.0 [[1.0, 1.5], [6.75, 6.5]]
# 1 [0, 0, 0, 1, 1, 1] 20.688 [[1.333, 1.333], [8.333, 8.333]]
# 2 [0, 0, 0, 1, 1, 1] 2.667 [[1.333, 1.333], [8.333, 8.333]]
