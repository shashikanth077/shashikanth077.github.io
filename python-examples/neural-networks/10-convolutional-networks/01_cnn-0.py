# -*- coding: utf-8 -*-
# ==========================================================================
# Why a CNN? Look at neighbouring pixels [neural-networks / Convolutional
# networks]
# ==========================================================================
# WHAT IT IS
# A dense network flattens an image into 784 numbers and forgets which pixels
# were neighbours. A convolutional neural network keeps the grid: small
# filters slide over the image, reusing the SAME weights at every position to
# detect local patterns — edges first, then shapes, then objects. A 3×3 filter
# looks at only 9 pixels per channel. Output: feature maps combined by dense
# layers into class probabilities (softmax gives ten for MNIST). Far fewer
# weights, and a pattern learned in one corner works everywhere.
#
# WHERE YOU USE IT
# A filter is a tiny magnifying glass checking the same pattern at every
# location; backpropagation learns its values, you do not design them.
#
# RUN IT:  python 01_cnn-0.py
#

dense_first = 784 * 100 + 100
conv_first = 3 * 3 * 1 * 32 + 32
print(dense_first, conv_first)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 78500 320
