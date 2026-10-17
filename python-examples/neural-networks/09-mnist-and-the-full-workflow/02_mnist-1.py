# -*- coding: utf-8 -*-
# ==========================================================================
# From pixels to numbers: normalize and flatten [neural-networks / MNIST and
# the full workflow]
# ==========================================================================
# WHAT IT IS
# A grayscale image has one intensity per pixel; an MNIST image is 28 × 28 =
# 784 numbers, the label an integer 0–9. Pixel values are 0–255; divide by 255
# so they live in 0–1 (0 → 0, 128 → 0.50196, 255 → 1). Flatten then lays the
# rows end to end: row 1, row 2, … giving a vector of 784 (64 for an 8×8 toy
# digit). Flatten changes only the shape, has no trainable parameters, and
# keeps the order.
#
# WHERE YOU USE IT
# Use the same scaling and shapes at training and prediction time. Standard
# MNIST stores light digits on a dark background.
#
# RUN IT:  python 02_mnist-1.py
#

import numpy as np

img = np.array([[1, 2, 3], [4, 5, 6]])
print(img.flatten().tolist(), img.shape, img.flatten().shape)
pixels = np.array([0, 128, 255])
print((pixels / 255).round(5).tolist())
print(28 * 28, 8 * 8)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [1, 2, 3, 4, 5, 6] (2, 3) (6,)
# [0.0, 0.50196, 1.0]
# 784 64
