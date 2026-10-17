# -*- coding: utf-8 -*-
# ==========================================================================
# The dot product of two vectors [numpy / Linear algebra]
# ==========================================================================
# WHAT IT IS
# Multiply matching elements and add them up: [3, 4] · [2, 5] = 3×2 + 4×5 =
# 26. In NumPy write np.dot(a, b) or a @ b. The result for two 1D arrays is a
# single number — a weighted score.
#
# WHERE YOU USE IT
# A neuron's pre-activation is x @ w + b: a dot product of inputs and weights.
#
# RUN IT:  python 01_linalg-0.py
#

import numpy as np

features = np.array([3, 4])
weights = np.array([2, 5])
print(np.dot(features, weights))
print(features @ weights)
print(np.dot([2, 3], [4, 5]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 26
# 26
# 23
