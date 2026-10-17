# -*- coding: utf-8 -*-
# ==========================================================================
# Corners: the Harris detector [computer-vision / Features and matching]
# ==========================================================================
# WHAT IT IS
# Good features are places that can be located precisely: corners. Look at the
# 2 × 2 structure matrix M = Σ [[Iₓ², IₓI_y], [IₓI_y, I_y²]] over a window.
# Two large eigenvalues → a corner (intensity changes in every direction); one
# large, one small → an edge; both small → a flat area. Harris scores R = det
# M − k (trace M)² with k ≈ 0.05: M = diag(2, 2) gives R = 4 − 0.05·16 = 3.2
# (corner), M = diag(2, 0.01) gives R ≈ −0.18 (edge), M ≈ 0 gives R ≈ 0
# (flat). Corners are then picked as local maxima of R above a threshold.
#
# WHERE YOU USE IT
# Harris corners are rotation-invariant but not scale-invariant; SIFT/ORB add
# scale.
#
# RUN IT:  python 01_feat-0.py
#

import numpy as np

for name, M in {"corner": np.diag([2.0, 2.0]), "edge": np.diag([2.0, 0.01]), "flat": np.diag([0.01, 0.01])}.items():
    R = np.linalg.det(M) - 0.05 * np.trace(M) ** 2
    print(name, np.linalg.eigvalsh(M).round(2).tolist(), round(float(R), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# corner [2.0, 2.0] 3.2
# edge [0.01, 2.0] -0.182
# flat [0.01, 0.01] 0.0
