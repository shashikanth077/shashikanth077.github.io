# -*- coding: utf-8 -*-
# ==========================================================================
# Homography: mapping one plane to another [computer-vision / Geometry and
# cameras]
# ==========================================================================
# WHAT IT IS
# Two views of a flat object (a document, a wall, a court) are related by a
# homography: a 3 × 3 matrix H with eight degrees of freedom. A point (x, y)
# maps to (x′, y′) = (h₁·p / h₃·p, h₂·p / h₃·p) with p = (x, y, 1) — the
# division is what makes it projective. Four point correspondences determine
# H. Uses: straightening a photographed document, stitching panoramas from a
# rotating camera, overlaying graphics on planes. For H = [[1, 0, 2], [0, 1,
# 3], [0.001, 0, 1]] the point (100, 50) maps to (102 / 1.1, 53 / 1.1) =
# (92.7, 48.2).
#
# WHERE YOU USE IT
# Use RANSAC to estimate H robustly when some correspondences are wrong.
#
# RUN IT:  python 06_geom-5.py
#

import numpy as np

H = np.array([[1, 0, 2], [0, 1, 3], [0.001, 0, 1]])
p = H @ [100, 50, 1]
print(p.round(2).tolist(), (p[:2] / p[2]).round(1).tolist())
print(2 * 4, 9 - 1)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [102.0, 53.0, 1.1] [92.7, 48.2]
# 8 8
