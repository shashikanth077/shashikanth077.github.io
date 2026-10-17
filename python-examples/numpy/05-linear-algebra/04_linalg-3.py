# -*- coding: utf-8 -*-
# ==========================================================================
# Norms and distances [numpy / Linear algebra]
# ==========================================================================
# WHAT IT IS
# np.linalg.norm(v) is the length of a vector (L2): √(3² + 4²) = 5; ord=1
# gives the sum of absolute values. The distance between two points is the
# norm of their difference. Dividing a vector by its norm gives a unit vector.
# axis=1 computes one norm per row.
#
# WHERE YOU USE IT
# k-nearest neighbours, clustering and embedding search all rank things by
# np.linalg.norm of differences.
#
# RUN IT:  python 04_linalg-3.py
#

import numpy as np

v = np.array([3, 4])
print(np.linalg.norm(v))
print(np.linalg.norm(v, ord=1))
print(v / np.linalg.norm(v))
a = np.array([1, 1])
b = np.array([4, 5])
print(np.linalg.norm(a - b))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5.0
# 7.0
# [0.6 0.8]
# 5.0
