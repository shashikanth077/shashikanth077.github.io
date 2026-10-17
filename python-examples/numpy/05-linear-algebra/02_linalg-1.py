# -*- coding: utf-8 -*-
# ==========================================================================
# Matrix multiplication and shapes [numpy / Linear algebra]
# ==========================================================================
# WHAT IT IS
# X @ W multiplies every row of X by every column of W. The inner sizes must
# match: (2, 2) @ (2, 3) works and gives (2, 3). Two samples with two features
# through three neurons give two outputs for each of the three neurons. Adding
# a bias of shape (3,) broadcasts across both rows.
#
# WHERE YOU USE IT
# A whole layer, for a whole batch, in one line: Z = X @ W + b.
#
# RUN IT:  python 02_linalg-1.py
#

import numpy as np

X = np.array([[3, 4], [1, 2]])
W = np.array([[2, 1, 0],
              [5, 3, 4]])
bias = np.array([1, 1, 1])
Z = X @ W + bias
print(Z)
print(Z.shape)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[27 16 17]
#  [13  8  9]]
# (2, 3)
