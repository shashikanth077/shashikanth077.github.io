# -*- coding: utf-8 -*-
# ==========================================================================
# Creating arrays [numpy / Arrays: the basics]
# ==========================================================================
# WHAT IT IS
# Rather than typing numbers, create them: zeros, ones and full fill a shape,
# arange counts like range (stop excluded), linspace gives evenly spaced
# values including both ends, and eye is the identity matrix. Pass the shape
# as a tuple.
#
# WHERE YOU USE IT
# Weights start as arrays of random numbers or zeros; masks and padding use
# zeros and ones; linspace makes x-values for plots.
#
# RUN IT:  python 04_start-3.py
#

import numpy as np

print(np.zeros((2, 3)))
print(np.full((2, 2), 7))
print(np.arange(0, 10, 2))
print(np.linspace(0, 1, 5))
print(np.eye(3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[0. 0. 0.]
#  [0. 0. 0.]]
# [[7 7]
#  [7 7]]
# [0 2 4 6 8]
# [0.   0.25 0.5  0.75 1.  ]
# [[1. 0. 0.]
#  [0. 1. 0.]
#  [0. 0. 1.]]
