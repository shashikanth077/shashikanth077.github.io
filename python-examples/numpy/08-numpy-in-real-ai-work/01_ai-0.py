# -*- coding: utf-8 -*-
# ==========================================================================
# An image is an array [numpy / NumPy in real AI work]
# ==========================================================================
# WHAT IT IS
# A grayscale image is a 2D array of brightness values: rows are pixel rows,
# columns are pixel columns, and each number runs from 0 (black) to 255
# (white), stored as uint8. Every image operation — crop, flip, brighten,
# invert — is array indexing and arithmetic.
#
# WHERE YOU USE IT
# A neural network "sees" an image as exactly this array (usually scaled to
# 0–1).
#
# RUN IT:  python 01_ai-0.py
#

import numpy as np

img = np.array([[0, 128, 255],
                [64, 192, 32],
                [255, 0, 128]], dtype=np.uint8)
print(img.shape, img.dtype)
print(img.mean())
print(255 - img)
print(img[0, 1:])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (3, 3) uint8
# 117.11111111111111
# [[255 127   0]
#  [191  63 223]
#  [  0 255 127]]
# [128 255]
