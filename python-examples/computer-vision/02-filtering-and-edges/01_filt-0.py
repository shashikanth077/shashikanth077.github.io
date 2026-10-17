# -*- coding: utf-8 -*-
# ==========================================================================
# Convolution: sliding a kernel [computer-vision / Filtering and edges]
# ==========================================================================
# WHAT IT IS
# A filter replaces every pixel by a weighted sum of its neighbourhood, with
# the weights stored in a small matrix, the kernel. Slide it over the image,
# multiply, add: out(r, c) = Σ img(r + i, c + j) · k(i, j). Image processing
# libraries mean correlation when they say convolution (no kernel flip). The
# output is smaller than the input by (kernel size − 1) unless the border is
# padded. The same operation, with learned kernels, is the building block of
# convolutional neural networks.
#
# WHERE YOU USE IT
# Padding choices (zeros, reflect, replicate) matter at the border:
# zero-padding creates dark rims.
#
# RUN IT:  python 01_filt-0.py
#

import numpy as np

def conv2d(img, k):
    h, w = k.shape
    return np.array([[(img[r:r + h, c:c + w] * k).sum() for c in range(img.shape[1] - w + 1)] for r in range(img.shape[0] - h + 1)])
img = np.arange(25).reshape(5, 5).astype(float)
k = np.ones((3, 3)) / 9
out = conv2d(img, k)
print(out.shape)
print(out.round(1).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (3, 3)
# [[6.0, 7.0, 8.0], [11.0, 12.0, 13.0], [16.0, 17.0, 18.0]]
