# -*- coding: utf-8 -*-
# ==========================================================================
# Images are grids of numbers [matplotlib / Images and heatmaps]
# ==========================================================================
# WHAT IT IS
# ax.imshow(array) draws a 2D array as a picture, one square per number. For a
# greyscale image, 0 is black and 255 is white, so the numbers themselves are
# the picture. A colour image is a 3D array (height, width, 3). Use
# cmap="gray" for single-channel data, otherwise Matplotlib paints it in its
# default colours.
#
# WHERE YOU USE IT
# Computer vision starts here: a photo is just an array you can slice, scale
# and plot.
#
# RUN IT:  python 01_image-0.py
#

import numpy as np
import matplotlib.pyplot as plt

img = np.array([[0, 128, 255],
                [64, 192, 32],
                [255, 0, 128]], dtype=np.uint8)
fig, ax = plt.subplots()
ax.imshow(img, cmap="gray", vmin=0, vmax=255)
plt.show()
print(img.shape, img.dtype)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (3, 3) uint8
