# -*- coding: utf-8 -*-
# ==========================================================================
# Sampling and quantization [computer-vision / Images as data]
# ==========================================================================
# WHAT IT IS
# Digitising an image means sampling (measuring the light at a grid of
# positions — the resolution) and quantization (rounding each measurement to
# one of 2^b levels — the bit depth). With b = 8 there are 256 grey levels;
# with b = 3 only 8, which causes visible banding. Halving the resolution cuts
# the pixel count to a quarter. File size follows directly: 1920 × 1080 × 3
# bytes ≈ 6.2 MB uncompressed. Too few samples cause aliasing (jagged edges,
# moiré), which is why images are blurred slightly before being downsampled.
#
# WHERE YOU USE IT
# Resolution is a cost–accuracy trade-off: a model on 224 × 224 inputs is far
# cheaper than on 1024 × 1024 and often accurate enough.
#
# RUN IT:  python 07_img-6.py
#

import numpy as np

x = np.linspace(0, 255, 6)
for bits in (3, 8):
    levels = 2 ** bits
    q = np.round(x / 255 * (levels - 1)) / (levels - 1) * 255
    print(bits, levels, q.round().astype(int).tolist())
print(1920 * 1080 * 3, (1920 // 2) * (1080 // 2) * 3)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3 8 [0, 36, 109, 146, 219, 255]
# 8 256 [0, 51, 102, 153, 204, 255]
# 6220800 1555200
