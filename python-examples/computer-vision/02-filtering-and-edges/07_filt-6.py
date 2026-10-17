# -*- coding: utf-8 -*-
# ==========================================================================
# Separable filters and cost [computer-vision / Filtering and edges]
# ==========================================================================
# WHAT IT IS
# A 2-D kernel is separable if it is an outer product of two 1-D vectors, k =
# a bᵀ; then convolving with k equals convolving rows with b and columns with
# a. A k × k kernel costs k² multiplications per pixel directly but only 2k
# separably: for k = 15 that is 225 versus 30. The Gaussian and box filters
# are separable; Sobel is too: [[1], [2], [1]] times [−1, 0, 1]. For large
# kernels the FFT (convolution = pointwise product in the frequency domain) is
# faster still. Efficiency matters because vision code runs on millions of
# pixels, often in real time.
#
# WHERE YOU USE IT
# Check separability with the matrix rank: a separable kernel has rank 1.
#
# RUN IT:  python 07_filt-6.py
#

import numpy as np

def conv2d(img, k):
    h, w = k.shape
    return np.array([[(img[r:r + h, c:c + w] * k).sum() for c in range(img.shape[1] - w + 1)] for r in range(img.shape[0] - h + 1)])
a, b = np.array([1.0, 2.0, 1.0]), np.array([-1.0, 0.0, 1.0])
K = np.outer(a, b)
img = np.random.default_rng(0).random((8, 8))
direct = conv2d(img, K)
rows = np.array([[(img[r, c:c + 3] * b).sum() for c in range(6)] for r in range(8)])
both = np.array([[(rows[r:r + 3, c] * a).sum() for c in range(6)] for r in range(6)])
print(K.tolist(), int(np.linalg.matrix_rank(K)), bool(np.allclose(direct, both)))
print(15 * 15, 2 * 15)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[-1.0, 0.0, 1.0], [-2.0, 0.0, 2.0], [-1.0, 0.0, 1.0]] 1 True
# 225 30
