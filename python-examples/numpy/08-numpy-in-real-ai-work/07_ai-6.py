# -*- coding: utf-8 -*-
# ==========================================================================
# Distances with broadcasting [numpy / NumPy in real AI work]
# ==========================================================================
# WHAT IT IS
# Subtracting a (2,) query from a (3, 2) array of points broadcasts the query
# to every row. Square, sum along axis=1 and take the root: one distance per
# point, with no loop. np.linalg.norm(points - q, axis=1) does the same.
# argmin of the result is the nearest neighbour.
#
# WHERE YOU USE IT
# k-nearest neighbours, clustering and embedding search all compute distances
# this way — to thousands of points at once.
#
# RUN IT:  python 07_ai-6.py
#

import numpy as np

points = np.array([[0, 0], [3, 4], [6, 8]])
q = np.array([3, 4])
diff = points - q
d = np.sqrt((diff ** 2).sum(axis=1))
print(diff)
print(d)
print(d.argmin())
print(np.linalg.norm(points - q, axis=1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[-3 -4]
#  [ 0  0]
#  [ 3  4]]
# [5. 0. 5.]
# 1
# [5. 0. 5.]
