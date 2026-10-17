# -*- coding: utf-8 -*-
# ==========================================================================
# Encoder–decoder and U-Net [computer-vision / Semantic and instance
# segmentation]
# ==========================================================================
# WHAT IT IS
# Classifiers shrink the image to one label; segmentation must return to full
# resolution. Fully convolutional networks (FCN) keep spatial maps, and an
# encoder–decoder downsamples to capture context then upsamples to restore
# detail. U-Net adds skip connections that concatenate the encoder's
# high-resolution features onto the decoder at the same scale, so the sharp
# edges lost in pooling come back. Upsampling is done by interpolation or by
# transposed convolution, whose output size is (n − 1)·s + k − 2p: a 4 × 4 map
# with k = 3, s = 2, p = 0 becomes 9 × 9.
#
# WHERE YOU USE IT
# U-Net trains well with few images, which made it the default in biomedical
# segmentation.
#
# RUN IT:  python 02_sem-1.py
#

n, k, s, p = 4, 3, 2, 0
print((n - 1) * s + k - 2 * p)
import numpy as np
x = np.array([[1.0, 2.0], [3.0, 4.0]])
up = np.kron(x, np.ones((2, 2)))
print(up.tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 9
# [[1.0, 1.0, 2.0, 2.0], [1.0, 1.0, 2.0, 2.0], [3.0, 3.0, 4.0, 4.0], [3.0, 3.0, 4.0, 4.0]]
