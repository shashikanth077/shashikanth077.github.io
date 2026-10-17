# -*- coding: utf-8 -*-
# ==========================================================================
# SVD and latent semantic analysis [machine-learning / Seeing and reducing
# data]
# ==========================================================================
# WHAT IT IS
# The singular value decomposition writes a matrix as a product of rotations
# and a diagonal matrix of singular values. Keeping only the largest few gives
# the best low-rank approximation. TruncatedSVD (also called LSA for text)
# does this to a sparse TF–IDF matrix WITHOUT centring it — which is why it
# works on sparse data where PCA would make the matrix dense. The squared
# singular values measure how much each component "explains". Treat the
# reduced space as a view that helps similarity and clustering, not as a
# perfect map of meaning.
#
# WHERE YOU USE IT
# Reduce a TF–IDF matrix to 100–300 components before clustering text, then
# check that the groups still make sense.
#
# RUN IT:  python 05_viz-6.py
#

import numpy as np

A = np.array([[3.0, 0.0], [0.0, 2.0], [0.0, 0.0]])
U, s, Vt = np.linalg.svd(A)
print(s.round(3).tolist(), round(float(s[0] ** 2 / (s ** 2).sum()), 3))
A1 = s[0] * np.outer(U[:, 0], Vt[0])
print(A1.round(3).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [3.0, 2.0] 0.692
# [[3.0, 0.0], [0.0, 0.0], [0.0, 0.0]]
