# -*- coding: utf-8 -*-
# ==========================================================================
# Homogeneous coordinates and the 3×3 matrix [computer-vision / Geometry and
# cameras]
# ==========================================================================
# WHAT IT IS
# Translation is not a matrix multiplication of (x, y) — but it becomes one if
# we add a coordinate: (x, y) → (x, y, 1). Then any similarity or affine
# transform is one 3 × 3 matrix, and transforms compose by multiplying
# matrices. M = [[2, 0, 5], [0, 2, 3], [0, 0, 1]] scales by 2 and shifts by
# (5, 3): the point (1, 1) becomes (7, 5). To invert a transform, invert the
# matrix. For a projective transform the last row is not (0, 0, 1) and you
# divide by the third coordinate at the end.
#
# WHERE YOU USE IT
# Order matters: rotate-then-translate differs from translate-then-rotate.
#
# RUN IT:  python 02_geom-1.py
#

import numpy as np

M = np.array([[2, 0, 5], [0, 2, 3], [0, 0, 1]], float)
print((M @ [1, 1, 1]).tolist())
T = np.array([[1, 0, 5], [0, 1, 3], [0, 0, 1]], float)
S = np.array([[2, 0, 0], [0, 2, 0], [0, 0, 1]], float)
print((T @ S @ [1, 1, 1]).tolist(), (S @ T @ [1, 1, 1]).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [7.0, 5.0, 1.0]
# [7.0, 5.0, 1.0] [12.0, 8.0, 1.0]
