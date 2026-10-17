# -*- coding: utf-8 -*-
# ==========================================================================
# Data augmentation [computer-vision / Image classification with CNNs]
# ==========================================================================
# WHAT IT IS
# Labelled images are expensive, so create more by applying label-preserving
# changes at training time: random flips, crops, rotations, scale, colour
# jitter, blur, cutout (erase a patch), mixup (blend two images and their
# labels). Each epoch the network sees different versions of the same photo,
# which acts as regularisation. Choose transformations that keep the label
# true: flipping a cat is fine, flipping a digit "6" into a "9"-like shape or
# a road sign's text is not. Four crops times two flips already multiplies the
# effective dataset size by 8.
#
# WHERE YOU USE IT
# Apply augmentation to training data only; validation and test images get the
# plain resize.
#
# RUN IT:  python 04_cls-3.py
#

import numpy as np

img = np.arange(16).reshape(4, 4)
flipped = img[:, ::-1]
crops = [img[r:r + 3, c:c + 3] for r in range(2) for c in range(2)]
print(flipped[0].tolist(), len(crops) * 2)
alpha = 0.3
mix = alpha * img + (1 - alpha) * flipped
print(mix[0].round(1).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [3, 2, 1, 0] 8
# [2.1, 1.7, 1.3, 0.9]
