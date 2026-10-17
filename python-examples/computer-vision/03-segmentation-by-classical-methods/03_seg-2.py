# -*- coding: utf-8 -*-
# ==========================================================================
# Morphology: erosion and dilation [computer-vision / Segmentation by
# classical methods]
# ==========================================================================
# WHAT IT IS
# Morphological operations probe a binary image with a small structuring
# element. Erosion keeps a pixel only if the whole element fits inside the
# foreground — objects shrink and thin protrusions vanish: a 3 × 3 square
# eroded by a 3 × 3 element leaves 1 pixel. Dilation sets a pixel if the
# element touches the foreground — objects grow and small holes close. Opening
# (erode then dilate) removes specks; closing (dilate then erode) fills gaps.
# The difference between dilation and erosion outlines the object.
#
# WHERE YOU USE IT
# Use opening to clean up thresholded noise and closing to join broken
# strokes, e.g. in text or cell masks.
#
# RUN IT:  python 03_seg-2.py
#

import numpy as np

B = np.zeros((7, 7), int)
B[1:4, 1:4] = 1
B[5, 5] = 1

def morph(a, op):
    p = np.pad(a, 1)
    f = np.min if op == "erode" else np.max
    return np.array([[f(p[r:r + 3, c:c + 3]) for c in range(a.shape[1])] for r in range(a.shape[0])])

opened = morph(morph(B, "erode"), "dilate")
print(B.sum(), morph(B, "erode").sum(), opened.sum())
print(opened.tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 10 1 9
# [[0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 0, 0, 0], [0, 1, 1, 1, 0, 0, 0], [0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]]
