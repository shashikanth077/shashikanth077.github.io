# -*- coding: utf-8 -*-
# ==========================================================================
# K-modes and K-prototypes: beyond numbers [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# "Card", "cash" and "wallet" are names: coding them 0, 1, 2 tells Euclidean
# distance that card is nearer cash than wallet. K-modes uses the mismatch
# distance d(x, z) = Σ 1[xᵣ ≠ zᵣ] and represents a group by its MODE (the most
# frequent category per feature, which need not be a real row). Customers A
# (Card, Morning), B (Card, Evening), C (Cash, Evening): d(A, B) = 1, d(A, C)
# = 2. K-prototypes mixes both: d = Σ numeric (xᵣ − μᵣ)² + γ Σ categorical
# 1[xᵣ ≠ modeᵣ]. Scaled spending 0.6 vs prototype 0.4 with a different payment
# and γ = 0.5: 0.04 + 0.5 = 0.54; with a matching payment only 0.04.
#
# WHERE YOU USE IT
# γ balances numeric against categorical features. Gower distance (with
# medoids or a suitable linkage) is another option for mixed data; Ward
# linkage needs Euclidean geometry.
#
# RUN IT:  python 20_cluster-24.py
#

mismatch = lambda a, b: sum(x != y for x, y in zip(a, b))
A, B, C = ("Card", "Morning"), ("Card", "Evening"), ("Cash", "Evening")
print(mismatch(A, B), mismatch(A, C))
print(round((0.6 - 0.4) ** 2 + 0.5 * 1, 2), round((0.6 - 0.4) ** 2, 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 2
# 0.54 0.04
