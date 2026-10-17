# -*- coding: utf-8 -*-
# ==========================================================================
# Colour spaces: RGB, grayscale and HSV [computer-vision / Images as data]
# ==========================================================================
# WHAT IT IS
# RGB matches how sensors and displays work, but its channels mix brightness
# and colour. Grayscale keeps brightness using weights that reflect human
# vision — green counts most: Y = 0.299 R + 0.587 G + 0.114 B. A pixel (200,
# 100, 50) has Y = 59.8 + 58.7 + 5.7 = 124.2. HSV separates hue (which
# colour), saturation (how pure) and value (brightness), which makes "find all
# red things whatever the lighting" simple. Other spaces: Lab (perceptual
# distances), YCbCr (video).
#
# WHERE YOU USE IT
# Converting to grayscale throws information away; for tasks where colour
# matters (ripe fruit, traffic lights) keep it.
#
# RUN IT:  python 03_img-2.py
#

import colorsys

import numpy as np

pixel = np.array([200, 100, 50])
print(round(float(pixel @ [0.299, 0.587, 0.114]), 1))
h, s, v = colorsys.rgb_to_hsv(*(pixel / 255))
print(round(h * 360), round(s, 2), round(v, 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 124.2
# 20 0.75 0.78
