# -*- coding: utf-8 -*-
# ==========================================================================
# Colour images and channels [numpy / NumPy in real AI work]
# ==========================================================================
# WHAT IT IS
# A colour image adds a third dimension: (height, width, 3) for red, green and
# blue channels. img[:, :, 0] is the red channel; img[10, 20] is the (R, G, B)
# of one pixel. Deep-learning libraries may expect channels first, (3, height,
# width), which np.transpose gives you.
#
# WHERE YOU USE IT
# Preprocessing for vision models: select channels, scale to 0–1, reorder axes
# and stack images into a batch.
#
# RUN IT:  python 02_ai-1.py
#

import numpy as np

img = np.zeros((2, 2, 3), dtype=np.uint8)
img[0, 0] = [255, 0, 0]
img[1, 1] = [0, 0, 255]
print(img.shape)
print(img[:, :, 0])
print(img[0, 0])
print(np.transpose(img, (2, 0, 1)).shape)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (2, 2, 3)
# [[255   0]
#  [  0   0]]
# [255   0   0]
# (3, 2, 2)
