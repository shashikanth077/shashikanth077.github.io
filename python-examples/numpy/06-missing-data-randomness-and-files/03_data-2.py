# -*- coding: utf-8 -*-
# ==========================================================================
# Random numbers with default_rng [numpy / Missing data, randomness and files]
# ==========================================================================
# WHAT IT IS
# Create a generator with rng = np.random.default_rng(seed), then draw from
# it: rng.integers(1, 7, size=5) (dice), rng.random(3) (uniform 0–1),
# rng.normal(loc=70, scale=10, size=5) (bell curve) and rng.permutation(n) (a
# shuffled order). Prefer this over the old global np.random.seed.
#
# WHERE YOU USE IT
# Random initial weights, noise, bootstrap samples, shuffled batches and
# simulated data all come from a generator.
#
# RUN IT:  python 03_data-2.py
#

import numpy as np

rng = np.random.default_rng(42)
print(rng.integers(1, 7, size=5))
print(rng.random(3))
print(rng.normal(loc=70, scale=10, size=5).round(1))
X = np.array([[1, 2], [3, 4], [5, 6]])
indices = rng.permutation(len(X))
print(X[indices])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [1 5 4 3 3]
# [0.69736803 0.09417735 0.97562235]
# [71.3 66.8 69.8 61.5 78.8]
# [[1 2]
#  [3 4]
#  [5 6]]
