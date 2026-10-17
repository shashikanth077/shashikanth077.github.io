# -*- coding: utf-8 -*-
# ==========================================================================
# Shapes and tuples: (224, 224, 3) [python-ai / Python in real AI work]
# ==========================================================================
# WHAT IT IS
# An image is a grid of pixels with colour channels, so its shape is a tuple:
# (height, width, channels). Unpack it, compare it and use it to validate
# input. Datasets add a leading batch dimension, as in (32, 224, 224, 3).
#
# WHERE YOU USE IT
# Shape mismatches are the most common error in deep-learning code. Read
# shapes as tuples and unpack them to check your assumptions.
#
# RUN IT:  python 02_ai-1.py
#

image_shape = (224, 224, 3)
height, width, channels = image_shape
batch_shape = (32,) + image_shape
print(width, channels)
print(batch_shape)
print(height * width * channels)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 224 3
# (32, 224, 224, 3)
# 150528
