# -*- coding: utf-8 -*-
# ==========================================================================
# Image gradients and the Sobel operator [computer-vision / Filtering and
# edges]
# ==========================================================================
# WHAT IT IS
# An edge is a place where intensity changes quickly, so edges are found with
# the gradient: ∂I/∂x (change across columns) and ∂I/∂y (change down rows).
# The Sobel kernels combine a derivative with a little smoothing: Kx = [[−1,
# 0, 1], [−2, 0, 2], [−1, 0, 1]] and Ky = Kxᵀ. On a 6 × 6 image that is 0 on
# the left half and 100 on the right, Gₓ is 0, 400, 400, 0 across the first
# row and G_y is 0 everywhere. The magnitude √(Gₓ² + G_y²) says how strong the
# edge is, the direction atan2(G_y, Gₓ) says which way it points.
#
# WHERE YOU USE IT
# Edge strength depends on contrast; normalise or threshold relative to the
# image.
#
# RUN IT:  python 05_filt-4.py
#

import numpy as np

def conv2d(img, k):
    h, w = k.shape
    return np.array([[(img[r:r + h, c:c + w] * k).sum() for c in range(img.shape[1] - w + 1)] for r in range(img.shape[0] - h + 1)])
img = np.zeros((6, 6))
img[:, 3:] = 100
Kx = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
gx, gy = conv2d(img, Kx), conv2d(img, Kx.T)
print(gx[0].tolist(), gy[0].tolist())
print(np.hypot(gx, gy)[0].tolist())
print(round(float(np.degrees(np.arctan2(gy[0, 1], gx[0, 1]))), 1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.0, 400.0, 400.0, 0.0] [0.0, 0.0, 0.0, 0.0]
# [0.0, 400.0, 400.0, 0.0]
# 0.0
