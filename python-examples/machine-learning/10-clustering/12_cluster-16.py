# -*- coding: utf-8 -*-
# ==========================================================================
# Fuzzy c-means: partly in both groups [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# Hard clustering gives one group per point. Fuzzy c-means gives each point a
# membership in every group, summing to 1 (degrees of fit under the algorithm,
# not calibrated probabilities). uᵢⱼ = 1 / Σₖ (dᵢⱼ / dᵢₖ)^(2/(m−1)) with
# fuzziness m > 1; centres use squared memberships: cⱼ = Σ uᵢⱼᵐ xᵢ / Σ uᵢⱼᵐ.
# Centres 2 and 8, customer 4 (distances 2 and 4), m = 2: u₁ = 1/[1 + (2/4)²]
# = 0.8, u₂ = 0.2. Drag the customer and m.
#
# WHERE YOU USE IT
# If a point equals a centre its distance is 0: give it full membership of
# that centre. A larger m makes memberships softer. You still choose the
# number of groups.
#
# RUN IT:  python 12_cluster-16.py
#

import numpy as np

def memberships(x, centres, m):
    d = np.abs(x - np.array(centres, dtype=float))
    inv = (1 / d) ** (2 / (m - 1))
    return inv / inv.sum()

print(memberships(4, [2, 8], 2).round(2).tolist(), memberships(4, [3, 7], 2).round(2).tolist())
x, u = np.array([3.0, 4.0]), np.array([0.9, 0.8])
print(round(float((u ** 2 * x).sum() / (u ** 2).sum()), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.8, 0.2] [0.9, 0.1]
# 3.441
