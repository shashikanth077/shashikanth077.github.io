# -*- coding: utf-8 -*-
# ==========================================================================
# Kernels as feature detectors [neural-networks / Convolutional networks]
# ==========================================================================
# WHAT IT IS
# Different kernels react to different patterns. A vertical-edge (Sobel)
# kernel [[−1,0,1],[−2,0,2],[−1,0,1]] responds to brightness changes across
# columns; its transpose finds horizontal edges. Average blur [1/9]… smooths;
# sharpen [[0,−1,0],[−1,5,−1],[0,−1,0]] boosts differences. On a 6×6 image
# whose right half is bright (left 0, right 1) the vertical Sobel gives 4 in
# the two columns that straddle the edge and 0 elsewhere. A CNN learns many
# such kernels, one per output channel.
#
# WHERE YOU USE IT
# These are hand-made demo filters; real CNNs learn theirs.
#
# RUN IT:  python 05_cnn-4.py
#

import numpy as np

img = np.zeros((6, 6))
img[:, 3:] = 1
V = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
out = np.array([[(img[r:r + 3, c:c + 3] * V).sum() for c in range(4)] for r in range(4)])
print(out[0].tolist(), out.T[0].tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.0, 4.0, 4.0, 0.0] [0.0, 0.0, 0.0, 0.0]
