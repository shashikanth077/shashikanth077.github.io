# -*- coding: utf-8 -*-
# ==========================================================================
# Linkage changes the answer [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# "Distance between clusters" needs a rule. Single: the smallest cross-pair
# distance (can chain through thin bridges). Complete: the largest (prefers
# compact clusters). Average: the mean over all cross pairs. For U = {P,Q}, V
# = {R,S}: single min(6, 9, 5, 8) = 5, complete max = 9, average (6 + 9 + 5 +
# 8)/4 = 7: same first merges (1 and 3), different final height. Ward merges
# the pair with the smallest increase in within-cluster SSE: ΔJ = nᵤnᵥ/(nᵤ+nᵥ)
# × ‖μᵤ − μᵥ‖² = 49 here; SciPy reports √(2ΔJ) ≈ 9.899.
#
# WHERE YOU USE IT
# Always state the linkage when interpreting a tree. Ward needs Euclidean
# geometry; plot heights depend on the library's convention.
#
# RUN IT:  python 08_cluster-8.py
#

import numpy as np

U, V = np.array([1.0, 2.0]), np.array([7.0, 10.0])
cross = np.abs(U[:, None] - V[None]).ravel()
print(cross.min(), cross.max(), cross.mean())
delta = len(U) * len(V) / (len(U) + len(V)) * (U.mean() - V.mean()) ** 2
print(delta, round(float(np.sqrt(2 * delta)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5.0 9.0 7.0
# 49.0 9.899
