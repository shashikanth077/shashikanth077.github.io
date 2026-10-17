# -*- coding: utf-8 -*-
# ==========================================================================
# SOM, grid and subspace clustering [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# A self-organising map learns a grid of prototype vectors so similar
# customers land on nearby cells: find the best-matching unit, pull it toward
# the customer, pull its grid neighbours less: w_new = w_old + η · h(b, j) ·
# (x − w_old). For x = (4, 2), winner w = (2, 2), η = 0.5, h = 1: (2, 2) + 0.5
# × (2, 0) = (3, 2); a neighbour with h = 0.2 moves to (2.2, 2). The grid is a
# visualisation; you still need a step that groups the prototypes. Grid-based
# clustering counts points per cell and joins adjacent dense cells (counts [8,
# 7, 1] with threshold 5 → the first two form a region). Subspace methods such
# as CLIQUE look for groups visible in only some features.
#
# WHERE YOU USE IT
# Grid resolution, dimensionality and topology change the story. PCA changes
# coordinates; it does not assign groups.
#
# RUN IT:  python 21_cluster-25.py
#

import numpy as np

x, w, eta = np.array([4.0, 2.0]), np.array([2.0, 2.0]), 0.5
print((w + eta * 1.0 * (x - w)).tolist(), (w + eta * 0.2 * (x - w)).tolist())
counts, threshold = np.array([8, 7, 1]), 5
print((counts >= threshold).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [3.0, 2.0] [2.2, 2.0]
# [True, True, False]
