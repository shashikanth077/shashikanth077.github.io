# -*- coding: utf-8 -*-
# ==========================================================================
# Transpose [numpy / Reshaping and combining]
# ==========================================================================
# WHAT IT IS
# a.T swaps rows and columns: a (2, 3) array becomes (3, 2). Row i becomes
# column i. A transpose is a view, not a copy. You need it to make shapes line
# up for @, e.g. X.T @ X.
#
# WHERE YOU USE IT
# Gradients of weights are written with transposes: X.T @ error.
#
# RUN IT:  python 03_shape-2.py
#

import numpy as np

b = np.arange(1, 7).reshape(2, 3)
print(b)
print(b.T)
print(b.T.shape)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[1 2 3]
#  [4 5 6]]
# [[1 4]
#  [2 5]
#  [3 6]]
# (3, 2)
