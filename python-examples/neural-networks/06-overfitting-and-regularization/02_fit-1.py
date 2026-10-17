# -*- coding: utf-8 -*-
# ==========================================================================
# L1 and L2: a price tag on large weights [neural-networks / Overfitting and
# regularization]
# ==========================================================================
# WHAT IT IS
# Regularization adds a penalty for large weights to the loss, so the
# optimiser must trade fit against simplicity. L1: loss + λΣ|wᵢ| (absolute
# values; it can push weights exactly to zero — sparse). L2: loss + λΣwᵢ²
# (squares; it shrinks large weights hard but keeps most features alive).
# Elastic Net: λ[αΣ|wᵢ| + (1−α)Σwᵢ²] with α = 1 meaning pure L1 here
# (conventions differ between libraries). For w = 2 and λ = 0.2: L1 = 0.4, L2
# = 0.8. Neither penalises a weight of zero. Note: the L1 formula needs |w|; a
# plain signed sum would reward negative weights.
#
# WHERE YOU USE IT
# Scale features before comparing penalties; regularization does not guarantee
# fairness or causal relevance.
#
# RUN IT:  python 02_fit-1.py
#

import numpy as np

w, lam, alpha = 2.0, 0.2, 0.5
l1 = lam * abs(w)
l2 = lam * w ** 2
elastic = lam * (alpha * abs(w) + (1 - alpha) * w ** 2)
print(l1, l2, round(elastic, 2))
weights = np.array([0.5, -2.0, 0.0, 3.0])
print(round(float(lam * np.abs(weights).sum()), 2), round(float(lam * (weights ** 2).sum()), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.4 0.8 0.6
# 1.1 2.65
