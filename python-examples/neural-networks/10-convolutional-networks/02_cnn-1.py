# -*- coding: utf-8 -*-
# ==========================================================================
# Pixels are numbers; tensors have height × width × channels [neural-networks
# / Convolutional networks]
# ==========================================================================
# WHAT IT IS
# A grayscale image is a matrix: 0 is black, 255 is white. A tensor is
# described as height × width × channels: a 28×28×1 MNIST digit, a 224×224×3
# RGB input for VGG16. A 3×3 filter over an RGB image therefore has 3 × 3 × 3
# = 27 weights (plus an optional bias) because one filter spans all input
# channels. Convolution is nothing more than multiplication and addition of
# these numbers.
#
# WHERE YOU USE IT
# Channel position differs across libraries (channels-last in
# Keras/TensorFlow, channels-first in PyTorch).
#
# RUN IT:  python 02_cnn-1.py
#

import numpy as np

gray = np.zeros((28, 28, 1))
rgb = np.zeros((224, 224, 3))
print(gray.shape, rgb.shape, gray.size, rgb.size)
print(3 * 3 * 3, 3 * 3 * 3 + 1)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (28, 28, 1) (224, 224, 3) 784 150528
# 27 28
