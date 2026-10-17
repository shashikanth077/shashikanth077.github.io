# -*- coding: utf-8 -*-
# ==========================================================================
# Spectral clustering: connected neighbours [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# Two winding delivery routes can be close in space but separate along their
# paths, and a straight centre boundary would cut them apart. Spectral
# clustering builds a graph (points are nodes, near points get strong edges
# wᵢⱼ = exp(−‖xᵢ−xⱼ‖² / 2σ²)), forms the Laplacian L = D − W (D is the
# diagonal of row sums), takes eigenvectors for the smallest eigenvalues as
# new coordinates and clusters those. A tiny graph you can compute: A–B and
# C–D joined with weight 1, no links between the pairs. L has eigenvalue 0
# twice; v = [1, 1, −1, −1] gives Lv = 0, and its signs separate {A,B} from
# {C,D}.
#
# WHERE YOU USE IT
# You must choose the graph (neighbour count or σ) and the number of clusters.
# Dense similarity matrices are expensive. Too many neighbours can link
# separate groups.
#
# RUN IT:  python 15_cluster-19.py
#

import numpy as np

W = np.array([[0, 1, 0, 0], [1, 0, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]], dtype=float)
D = np.diag(W.sum(axis=1))
L = D - W
v = np.array([1, 1, -1, -1], dtype=float)
print(L.tolist())
print((L @ v).tolist(), (np.linalg.eigvalsh(L) + 0.0).round(3).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[1.0, -1.0, 0.0, 0.0], [-1.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, -1.0], [0.0, 0.0, -1.0, 1.0]]
# [0.0, 0.0, 0.0, 0.0] [0.0, 0.0, 2.0, 2.0]
