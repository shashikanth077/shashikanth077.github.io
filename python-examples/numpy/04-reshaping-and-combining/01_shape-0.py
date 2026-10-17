# -*- coding: utf-8 -*-
# ==========================================================================
# reshape and the −1 trick [numpy / Reshaping and combining]
# ==========================================================================
# WHAT IT IS
# reshape rearranges the same values into a new shape — the element count must
# stay the same. Use -1 for one size and NumPy works it out: a.reshape(2, -1).
# The values are read row by row, so 1–6 become [[1 2 3], [4 5 6]] in shape
# (2, 3). Eight values cannot become (3, 3).
#
# WHERE YOU USE IT
# Flattening an image before a dense layer, or turning one sample into a batch
# of one with reshape(1, -1), is everyday NumPy.
#
# RUN IT:  python 01_shape-0.py
#

import numpy as np

a = np.arange(1, 7)
b = a.reshape(2, 3)
print(b)
print(a.reshape(3, -1))
sample = np.array([20, 30, 40])
print(sample.reshape(1, -1).shape)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[1 2 3]
#  [4 5 6]]
# [[1 2]
#  [3 4]
#  [5 6]]
# (1, 3)
