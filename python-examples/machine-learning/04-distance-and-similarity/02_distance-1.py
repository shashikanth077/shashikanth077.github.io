# -*- coding: utf-8 -*-
# ==========================================================================
# Manhattan, Minkowski, Chebyshev and Hamming [machine-learning / Distance and
# similarity]
# ==========================================================================
# WHAT IT IS
# Different questions need different distances. Manhattan adds the absolute
# coordinate differences — like walking a street grid. Chebyshev takes the
# largest single difference. Minkowski with power p generalises them (p = 1
# Manhattan, p = 2 Euclidean). Hamming counts mismatching positions and suits
# categories and strings. Cosine compares direction rather than size (next
# lesson). Choose the distance that matches how "similar" is defined in your
# problem.
#
# WHERE YOU USE IT
# Manhattan gives large single-feature gaps less influence than Euclidean,
# which squares them.
#
# RUN IT:  python 02_distance-1.py
#

import numpy as np

p, q = np.array([1, 2]), np.array([4, 6])
print(float(np.sqrt(((p - q) ** 2).sum())), int(np.abs(p - q).sum()), int(np.abs(p - q).max()))
a, b = "karolin", "kathrin"
print(sum(x != y for x, y in zip(a, b)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5.0 7 4
# 3
