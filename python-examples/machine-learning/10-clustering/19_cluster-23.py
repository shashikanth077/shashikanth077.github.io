# -*- coding: utf-8 -*-
# ==========================================================================
# Affinity propagation: exemplars by message passing [machine-learning /
# Clustering]
# ==========================================================================
# WHAT IT IS
# Affinity propagation picks real points as exemplars by exchanging two
# messages: responsibility r(i, k) ("how much do I want you as my exemplar?")
# and availability a(i, k) ("how appropriate is it for me to choose you?").
# Similarity s(i, k) = −‖xᵢ − xₖ‖²; the diagonal "preference" s(k, k) controls
# how willing points are to be exemplars (higher → more exemplars). Example:
# orders at 1, 2, 8: s(1,2) = −1, s(1,8) = −49, preference −10, availabilities
# 0. For point 1 considering exemplar 2 the best alternative is max(−10, −49)
# = −10, so r(1, 2) = −1 − (−10) = 9. This is one message, not a result;
# damping blends old and new messages to reduce oscillation.
#
# WHERE YOU USE IT
# You do not enter K, but the preference acts like it. Full message matrices
# are expensive and convergence must be checked.
#
# RUN IT:  python 19_cluster-23.py
#

import numpy as np

x = np.array([1.0, 2.0, 8.0])
S = -((x[:, None] - x[None]) ** 2)
np.fill_diagonal(S, -10)
A = np.zeros((3, 3))
i, k = 0, 1
alternatives = [A[i, kk] + S[i, kk] for kk in range(3) if kk != k]
print(S.tolist())
print(S[i, k] - max(alternatives))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[-10.0, -1.0, -49.0], [-1.0, -10.0, -36.0], [-49.0, -36.0, -10.0]]
# 9.0
