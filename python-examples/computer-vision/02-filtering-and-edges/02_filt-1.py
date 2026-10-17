# -*- coding: utf-8 -*-
# ==========================================================================
# Blurring: box and Gaussian filters [computer-vision / Filtering and edges]
# ==========================================================================
# WHAT IT IS
# Blurring averages neighbours to suppress noise. A box filter gives equal
# weight to a k × k square. A Gaussian filter weights pixels by exp(−d²/2σ²),
# so near pixels count more and the result is smoother and free of blocky
# artefacts; the 3 × 3 kernel for σ = 1 is about [[0.075, 0.124, 0.075],
# [0.124, 0.204, 0.124], [0.075, 0.124, 0.075]] (weights sum to 1). Larger σ
# blurs more but also destroys fine detail and edges. Gaussian kernels are
# separable: a 2-D blur equals a 1-D blur along rows then along columns,
# cutting the cost from k² to 2k multiplications per pixel.
#
# WHERE YOU USE IT
# Blurring before edge detection or downsampling is standard practice: it
# removes noise and prevents aliasing.
#
# RUN IT:  python 02_filt-1.py
#

import numpy as np

x = np.array([-1.0, 0.0, 1.0])
g = np.exp(-x ** 2 / 2)
g /= g.sum()
k2 = np.outer(g, g)
print(g.round(3).tolist())
print(k2.round(3).tolist(), round(float(k2.sum()), 3))
print(3 * 3, 3 + 3, 15 * 15, 15 + 15)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.274, 0.452, 0.274]
# [[0.075, 0.124, 0.075], [0.124, 0.204, 0.124], [0.075, 0.124, 0.075]] 1.0
# 9 6 225 30
