# -*- coding: utf-8 -*-
# ==========================================================================
# A dense layer with an activation [numpy / Linear algebra]
# ==========================================================================
# WHAT IT IS
# A dense layer is Z = X @ W + b followed by an activation. ReLU keeps
# positives and zeroes negatives: np.maximum(0, Z). Here a batch of two
# samples goes through three neurons; one neuron produces negative values,
# which ReLU clamps to 0.
#
# WHERE YOU USE IT
# This is the forward pass of every feed-forward network, written in two lines
# of NumPy.
#
# RUN IT:  python 03_linalg-2.py
#

import numpy as np

X = np.array([[3, 4], [1, 2]])
W = np.array([[2, -1, 0],
              [5, -3, 4]])
b = np.array([1, 1, 1])
Z = X @ W + b
A = np.maximum(0, Z)
print(Z)
print(A)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[ 27 -14  17]
#  [ 13  -6   9]]
# [[27  0 17]
#  [13  0  9]]
