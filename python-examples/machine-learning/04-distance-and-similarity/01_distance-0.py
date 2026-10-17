# -*- coding: utf-8 -*-
# ==========================================================================
# Euclidean distance: straight-line similarity [machine-learning / Distance
# and similarity]
# ==========================================================================
# WHAT IT IS
# Clustering and nearest-neighbour methods need a definition of "near". The
# straight-line (Euclidean) distance between P and Q is d = √[(x_Q − x_P)² +
# (y_Q − y_P)²]. For A = (2, 3) and B = (5, 7): √(3² + 4²) = √25 = 5.
# Comparing squared distances picks the same nearest point and avoids the
# square root. Drag Q: the straight line is the Euclidean distance; the dashed
# corner path is the Manhattan distance.
#
# WHERE YOU USE IT
# Distance only means something if the features are on comparable scales and
# measure what you care about. Never use raw ID numbers as coordinates.
#
# RUN IT:  python 01_distance-0.py
#

import numpy as np

pts = {"A": (1, 1), "B": (1, 2), "C": (2, 1), "D": (8, 8)}
euclid = lambda p, q: float(np.hypot(p[0] - q[0], p[1] - q[1]))
print(round(euclid(pts["A"], pts["B"]), 3), round(euclid(pts["B"], pts["C"]), 3), round(euclid(pts["A"], pts["D"]), 3))
print(euclid((2, 3), (5, 7)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.0 1.414 9.899
# 5.0
