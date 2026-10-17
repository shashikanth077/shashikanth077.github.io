# -*- coding: utf-8 -*-
# ==========================================================================
# Describing a region: area, centroid and shape [computer-vision /
# Segmentation by classical methods]
# ==========================================================================
# WHAT IT IS
# Once a region is isolated, simple numbers describe it. Area = pixel count.
# Centroid = mean of the pixel coordinates. Bounding box = min and max
# coordinates. Perimeter counts boundary pixels. Circularity = 4π·area /
# perimeter² is 1 for a perfect circle and smaller for elongated shapes: a
# disc of radius 10 has area ≈ 314 and perimeter ≈ 62.8, circularity ≈ 1.0; a
# 1 × 100 strip has circularity ≈ 0.03. Such features feed classical
# inspection systems (is this screw the right size, is this cell round?).
#
# WHERE YOU USE IT
# Convert pixels to real units with the camera's scale (mm per pixel) before
# applying tolerances.
#
# RUN IT:  python 06_seg-5.py
#

import numpy as np

pixels = np.array([(1, 1), (1, 2), (2, 1), (2, 2), (3, 2)])
print(len(pixels), pixels.mean(axis=0).tolist(), pixels.min(axis=0).tolist(), pixels.max(axis=0).tolist())
circ = lambda area, per: 4 * np.pi * area / per ** 2
print(round(float(circ(np.pi * 10 ** 2, 2 * np.pi * 10)), 2), round(float(circ(100, 202)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5 [1.8, 1.6] [1, 1] [3, 2]
# 1.0 0.031
