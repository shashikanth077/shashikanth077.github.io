# -*- coding: utf-8 -*-
# ==========================================================================
# Solving linear systems [numpy / Linear algebra]
# ==========================================================================
# WHAT IT IS
# For equations like x + y = 4 and x − y = 2, put the coefficients in a matrix
# A and the right-hand sides in b, then np.linalg.solve(A, b) returns the
# solution — prefer it to computing the inverse. np.linalg.det and
# np.linalg.inv are there too, but solve is faster and more accurate.
#
# WHERE YOU USE IT
# Closed-form linear regression (the normal equations) and many scientific
# models reduce to a linear solve.
#
# RUN IT:  python 05_linalg-4.py
#

import numpy as np

A = np.array([[1, 1],
              [1, -1]])
b = np.array([4, 2])
print(np.linalg.solve(A, b))
print(np.linalg.det(A))
print(np.linalg.inv(A))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [3. 1.]
# -2.0
# [[ 0.5  0.5]
#  [ 0.5 -0.5]]
