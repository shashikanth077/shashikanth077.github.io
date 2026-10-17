# -*- coding: utf-8 -*-
# ==========================================================================
# Three dimensions: stacks and images [numpy / Arrays: the basics]
# ==========================================================================
# WHAT IT IS
# A 3D array is a stack of 2D tables — frames of a video, or the colour
# channels of an image. three_d[1, 0, 1] means layer 1, row 0, column 1. Add
# the three sizes in order: (layers, rows, columns). A colour image is
# (height, width, 3).
#
# WHERE YOU USE IT
# Colour images, audio spectrograms and batches of sequences are 3D arrays;
# deep-learning layers expect exactly these shapes.
#
# RUN IT:  python 06_start-5.py
#

import numpy as np

three_d = np.array([[[1, 2], [3, 4]], [[5, 6], [7, 8]]])
print(three_d.ndim, three_d.shape)
print(three_d[1, 0, 1])
print(three_d[0])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3 (2, 2, 2)
# 6
# [[1 2]
#  [3 4]]
