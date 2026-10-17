# -*- coding: utf-8 -*-
# ==========================================================================
# Vectorised arithmetic: one operation, many values [numpy / Maths,
# broadcasting and axes]
# ==========================================================================
# WHAT IT IS
# Arithmetic on an array applies to every element: prices + 10, prices 0.9,
# prices 2. Two arrays of the same shape combine position by position: x + y.
# This is "vectorised" code — no loop in sight — and it is both shorter and
# faster than a Python loop.
#
# WHERE YOU USE IT
# Scaling a feature, subtracting a mean, applying a discount to every price or
# adding a bias to every score is one expression.
#
# RUN IT:  python 01_math-0.py
#

import numpy as np

prices = np.array([100, 200, 300])
print(prices + 10)
print(prices * 0.9)
print(prices / 2)
print(prices ** 2)
x = np.array([1, 2, 3])
y = np.array([4, 5, 6])
print(x + y)
print(x * y)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [110 210 310]
# [ 90. 180. 270.]
# [ 50. 100. 150.]
# [10000 40000 90000]
# [5 7 9]
# [ 4 10 18]
