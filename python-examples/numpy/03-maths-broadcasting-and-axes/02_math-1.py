# -*- coding: utf-8 -*-
# ==========================================================================
# Universal functions: sqrt, exp and log [numpy / Maths, broadcasting and
# axes]
# ==========================================================================
# WHAT IT IS
# NumPy ships maths functions that work on whole arrays: np.sqrt, np.exp,
# np.log (natural log), np.abs, np.sin and many more. They are called
# universal functions, or ufuncs, and they apply element by element just like
# the operators.
#
# WHERE YOU USE IT
# Sigmoid, softmax and cross-entropy are built from np.exp and np.log applied
# to arrays of scores.
#
# RUN IT:  python 02_math-1.py
#

import numpy as np

x = np.array([1, 4, 9])
print(np.sqrt(x))
print(np.exp([0, 1]))
print(np.log([1, np.e]))
print(np.abs([-3, 2]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [1. 2. 3.]
# [1.         2.71828183]
# [0. 1.]
# [3 2]
