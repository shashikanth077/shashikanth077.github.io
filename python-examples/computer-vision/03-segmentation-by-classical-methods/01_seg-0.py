# -*- coding: utf-8 -*-
# ==========================================================================
# Thresholding and Otsu's method [computer-vision / Segmentation by classical
# methods]
# ==========================================================================
# WHAT IT IS
# The simplest segmentation turns a grayscale image into foreground and
# background: pixel = 1 if intensity ≥ T. A global threshold works if lighting
# is even; adaptive thresholds use the local mean when it is not. Otsu's
# method picks T automatically by maximising the between-class variance σ²_B =
# w₀ w₁ (μ₀ − μ₁)² of the two groups the threshold creates. For the bimodal
# histogram [0, 5, 20, 5, 0, 0, 6, 18, 6, 0] (dark peak at 2, bright peak at
# 7) any threshold from 4 to 6 separates the two modes with σ²_B = 6.25, far
# above a threshold placed inside a peak (T = 2: 1.11).
#
# WHERE YOU USE IT
# Otsu assumes two classes of roughly similar size; with a tiny foreground the
# threshold is biased.
#
# RUN IT:  python 01_seg-0.py
#

import numpy as np

hist = np.array([0, 5, 20, 5, 0, 0, 6, 18, 6, 0], float)
p = hist / hist.sum()
levels = np.arange(10)
for t in range(2, 9):
    w0, w1 = p[:t].sum(), p[t:].sum()
    if w0 == 0 or w1 == 0:
        continue
    m0, m1 = (levels[:t] * p[:t]).sum() / w0, (levels[t:] * p[t:]).sum() / w1
    print(t, round(float(w0 * w1 * (m0 - m1) ** 2), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2 1.114
# 3 5.207
# 4 6.25
# 5 6.25
# 6 6.25
# 7 5.042
# 8 1.361
