# -*- coding: utf-8 -*-
# ==========================================================================
# K-means by hand: squared distances and SSE [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# Carry the six locations through two rounds. Squared distances to the
# starting centres (1,1) and (2,1): A 0 / 1, B 1 / 2, C 1 / 0, D 98 / 85, E
# 113 / 100, F 113 / 98, so A, B join group 1 and C, D, E, F group 2; D to
# centre 2: (8−2)² + (8−1)² = 36 + 49 = 85. J = 0 + 1 + 0 + 85 + 100 + 98 =
# 284 km². Update: μ₁ = (1, 1.5), μ₂ = (6.75, 6.5). C is now closer to μ₁
# (1.25 vs 52.8125), so groups become {A, B, C}, {D, E, F} with centres (4/3,
# 4/3) and (25/3, 25/3); a further assignment changes nothing. Final J = 4/3 +
# 4/3 = 8/3 ≈ 2.667 km² (squared kilometres!).
#
# WHERE YOU USE IT
# A tie needs a consistent rule. If a cluster ends up empty the mean of zero
# points is undefined: implementations re-initialise it.
#
# RUN IT:  python 03_cluster-3.py
#

import numpy as np

X = np.array([[1, 1], [1, 2], [2, 1], [8, 8], [8, 9], [9, 8]], dtype=float)
c = np.array([[1.0, 1.0], [2.0, 1.0]])
d2 = ((X[:, None] - c[None]) ** 2).sum(2)
print(d2.tolist())
print(d2.argmin(1).tolist(), float(d2.min(1).sum()))
c2 = np.array([X[d2.argmin(1) == j].mean(axis=0) for j in range(2)])
print(c2.tolist())
d2b = ((X[:, None] - c2[None]) ** 2).sum(2)
print(d2b[2].round(4).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[0.0, 1.0], [1.0, 2.0], [1.0, 0.0], [98.0, 85.0], [113.0, 100.0], [113.0, 98.0]]
# [0, 0, 1, 1, 1, 1] 284.0
# [[1.0, 1.5], [6.75, 6.5]]
# [1.25, 52.8125]
