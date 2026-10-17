# -*- coding: utf-8 -*-
# ==========================================================================
# Gaussian mixtures: probability-based groups [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# A Gaussian mixture model (GMM) describes the data as a weighted mixture of
# bell curves — say quick orders and complex orders — and in several
# dimensions the components can be ellipses. The E-step computes each point's
# responsibility rᵢⱼ = πⱼ φⱼ(xᵢ) / Σₖ πₖ φₖ(xᵢ); the M-step updates Nⱼ = Σ
# rᵢⱼ, πⱼ = Nⱼ/n, μⱼ and σⱼ²; repeat until the log-likelihood barely improves.
# With μ = 0, 3, σ = 1 and equal shares, at x = 1 the densities are 0.24197
# and 0.05399, so r₁ ≈ 0.8176, r₂ ≈ 0.1824. Choose the number of components
# with BIC or AIC, not just the likelihood.
#
# WHERE YOU USE IT
# A GMM assigns probabilities even to unusual points: there is no DBSCAN-style
# noise label. Watch for tiny components and regularise covariances.
#
# RUN IT:  python 13_cluster-17.py
#

import numpy as np

pdf = lambda x, m, s: np.exp(-(x - m) ** 2 / (2 * s * s)) / (s * np.sqrt(2 * np.pi))
f1, f2 = pdf(1, 0, 1), pdf(1, 3, 1)
r1 = 0.5 * f1 / (0.5 * f1 + 0.5 * f2)
print(round(float(f1), 5), round(float(f2), 5), round(float(r1), 4), round(float(1 - r1), 4))
x, r = np.array([0, 1, 3.0]), np.array([0.9, 0.8, 0.1])
N = r.sum()
print(round(float(N), 2), round(float(N / 3), 2), round(float((r * x).sum() / N), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.24197 0.05399 0.8176 0.1824
# 1.8 0.6 0.6111
