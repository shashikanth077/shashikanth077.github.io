# -*- coding: utf-8 -*-
# ==========================================================================
# Element-wise product versus matrix product [numpy / Maths, broadcasting and
# axes]
# ==========================================================================
# WHAT IT IS
# multiplies matching elements and keeps the shape. @ (or np.matmul / np.dot)
# is the true linear-algebra product: rows times columns, summed. For two
# vectors, x @ y is the dot product, a single number. Mixing the two up is a
# classic bug.
#
# WHERE YOU USE IT
# Weights times inputs in a neural-network layer is @; applying a mask or a
# gate to activations is .
#
# RUN IT:  python 03_math-2.py
#

import numpy as np

x = np.array([1, 2, 3])
y = np.array([4, 5, 6])
print(x * y)
print(x @ y)
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])
print(A * B)
print(A @ B)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [ 4 10 18]
# 32
# [[ 5 12]
#  [21 32]]
# [[19 22]
#  [43 50]]
