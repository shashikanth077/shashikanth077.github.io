# -*- coding: utf-8 -*-
# ==========================================================================
# An image is an array of numbers [computer-vision / Images as data]
# ==========================================================================
# WHAT IT IS
# A grayscale image is a matrix of intensities, usually 8-bit integers from 0
# (black) to 255 (white); a colour image has three channels (red, green,
# blue), so its shape is height × width × 3. A 1920 × 1080 colour photo holds
# 1920 × 1080 × 3 = 6,220,800 numbers. Rows run top to bottom, so the pixel at
# (row r, column c) is img[r, c] — the origin is the top-left corner and y
# points down. Every vision algorithm is, in the end, arithmetic on these
# arrays.
#
# WHERE YOU USE IT
# Watch the conventions: libraries differ in channel order (OpenCV uses BGR)
# and in data type (uint8 0–255 versus float 0–1).
#
# RUN IT:  python 02_img-1.py
#

import numpy as np

img = np.array([[0, 64, 128], [192, 255, 32]], dtype=np.uint8)
print(img.shape, img.dtype, img[1, 0], img.min(), img.max())
rgb = np.zeros((480, 640, 3), dtype=np.uint8)
print(rgb.shape, rgb.size)
print(np.uint8(250) + np.uint8(10), 250 + 10)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (2, 3) uint8 192 0 255
# (480, 640, 3) 921600
# 4 260
