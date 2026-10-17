# -*- coding: utf-8 -*-
# ==========================================================================
# Histogram equalization [computer-vision / Images as data]
# ==========================================================================
# WHAT IT IS
# Equalization spreads the intensities so the histogram becomes roughly flat,
# using the cumulative distribution (CDF): new(v) = round( (CDF(v) − CDF_min)
# / (N − CDF_min) × (L − 1) ). A 4 × 4 image with 3-bit levels (0–7) has
# histogram [1, 3, 4, 4, 2, 1, 0, 1], CDF [1, 4, 8, 12, 14, 15, 15, 16]; with
# CDF_min = 1 the mapping is 0→0, 1→1, 2→3, 3→5, 4→6, 5→7, 7→7. Pixel 2 (the
# most common level region) is stretched to 3, level 3 to 5: contrast has
# increased where most pixels live. CLAHE applies this tile by tile with a
# clipping limit to avoid amplifying noise.
#
# WHERE YOU USE IT
# Equalization can over-enhance noise in flat regions; CLAHE is the usual
# remedy.
#
# RUN IT:  python 05_img-4.py
#

import numpy as np

img = np.array([[0, 1, 1, 2], [1, 2, 2, 3], [2, 3, 3, 4], [3, 4, 5, 7]])
hist = np.bincount(img.ravel(), minlength=8)
cdf = hist.cumsum()
cdf_min = cdf[cdf > 0].min()
lut = np.round((cdf - cdf_min) / (img.size - cdf_min) * 7).astype(int)
print(hist.tolist(), cdf.tolist())
print(lut.tolist())
print(lut[img].tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [1, 3, 4, 4, 2, 1, 0, 1] [1, 4, 8, 12, 14, 15, 15, 16]
# [0, 1, 3, 5, 6, 7, 7, 7]
# [[0, 1, 1, 3], [1, 3, 3, 5], [3, 5, 5, 6], [5, 6, 7, 7]]
