# -*- coding: utf-8 -*-
# ==========================================================================
# The median filter and salt-and-pepper noise [computer-vision / Filtering and
# edges]
# ==========================================================================
# WHAT IT IS
# The median filter replaces each pixel by the median of its neighbourhood — a
# non-linear operation. A flat patch [[10, 12, 11], [9, 255, 10], [11, 12,
# 10]] contains one hot pixel (255). The mean of the nine values is 37.8, so a
# blur smears the outlier into its neighbours; the median is 11, so the
# outlier disappears completely and edges stay sharp. That is why the median
# filter is the standard cure for salt-and-pepper noise, while Gaussian blur
# suits Gaussian noise.
#
# WHERE YOU USE IT
# Median filtering costs more than a convolution (sorting) but is robust to
# outliers.
#
# RUN IT:  python 03_filt-2.py
#

import numpy as np

patch = np.array([[10, 12, 11], [9, 255, 10], [11, 12, 10]])
print(round(float(patch.mean()), 1), float(np.median(patch)))
rng = np.random.default_rng(0)
img = np.full((20, 20), 100.0)
img[rng.random(img.shape) < 0.05] = 255
def median3(a):
    return np.array([[np.median(a[r:r + 3, c:c + 3]) for c in range(a.shape[1] - 2)] for r in range(a.shape[0] - 2)])
print(int((img == 255).sum()), int((median3(img) == 255).sum()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 37.8 11.0
# 18 0
