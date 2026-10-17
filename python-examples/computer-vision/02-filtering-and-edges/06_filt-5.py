# -*- coding: utf-8 -*-
# ==========================================================================
# Canny edge detection [computer-vision / Filtering and edges]
# ==========================================================================
# WHAT IT IS
# Canny's detector turns noisy gradients into thin, connected edges in four
# steps. (1) Smooth with a Gaussian. (2) Compute gradient magnitude and
# direction. (3) Non-maximum suppression: keep a pixel only if it is the
# largest along the gradient direction, thinning ridges to one pixel. (4)
# Hysteresis thresholding: pixels above a high threshold are strong edges;
# pixels between the low and high thresholds are kept only if connected to a
# strong edge. With thresholds (50, 150), a pixel of 120 survives if it
# touches a pixel of 200 but not otherwise. This suppresses noise while
# keeping real, connected contours.
#
# WHERE YOU USE IT
# A common starting point is high = 2–3 × low; tune on your images.
#
# RUN IT:  python 06_filt-5.py
#

import numpy as np

mag = np.array([0, 40, 120, 200, 130, 60, 0])
low, high = 50, 150
strong = mag >= high
weak = (mag >= low) & ~strong
keep = strong.copy()
for _ in range(3):
    for i in range(1, len(mag) - 1):
        if weak[i] and (keep[i - 1] or keep[i + 1]):
            keep[i] = True
print(strong.astype(int).tolist(), keep.astype(int).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0, 0, 0, 1, 0, 0, 0] [0, 0, 1, 1, 1, 1, 0]
