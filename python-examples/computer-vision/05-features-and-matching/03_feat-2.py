# -*- coding: utf-8 -*-
# ==========================================================================
# Local descriptors: SIFT, ORB and HOG [computer-vision / Features and
# matching]
# ==========================================================================
# WHAT IT IS
# A detected keypoint is described by a vector summarising its neighbourhood,
# so it can be matched in another image. SIFT finds scale-space extrema and
# builds a 128-number descriptor: 4 × 4 spatial cells × 8 gradient-orientation
# bins, normalised against lighting. ORB uses binary tests and is fast and
# free. HOG (histogram of oriented gradients) counts gradient directions
# inside cells of a window: a cell with strong vertical edges puts its weight
# in the 0° bin. HOG + a linear classifier was the classic pedestrian detector
# before deep learning.
#
# WHERE YOU USE IT
# Descriptors are designed to be invariant to small shifts, lighting changes
# and (SIFT) rotation and scale.
#
# RUN IT:  python 03_feat-2.py
#

import numpy as np

def hog_cell(gx, gy, bins=9):
    mag = np.hypot(gx, gy)
    ang = np.degrees(np.arctan2(gy, gx)) % 180
    hist = np.zeros(bins)
    for m, a in zip(mag.ravel(), ang.ravel()):
        hist[int(a // (180 / bins)) % bins] += m
    return hist

gx = np.array([[4.0, 4.0], [4.0, 4.0]])
gy = np.zeros((2, 2))
print(hog_cell(gx, gy).tolist(), 4 * 4 * 8)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [16.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0] 128
