# -*- coding: utf-8 -*-
# ==========================================================================
# 2-D convolution: multiply, then add [neural-networks / Convolutional
# networks]
# ==========================================================================
# WHAT IT IS
# For a 2-D image the kernel slides left to right then down. At every stop
# multiply the covered entries by the kernel and add: out(r,c) = Σ in(r+i,
# c+j) × kernel(i,j) + bias. The lecture's example: a 6×6 input and kernel
# [[0,1,0],[1,0,1],[1,0,1]]. The first window [[1,2,3],[-1,0,3],[1,2,-3]]
# gives 0+2+0 + (−1)+0+3 + 1+0+(−3) = 2. The whole 4×4 feature map is
# [[2,6,1,5],[0,8,−2,5],[2,0,3,1],[−2,6,2,0]]. Size: (6 − 3)/1 + 1 = 4.
#
# WHERE YOU USE IT
# Trained kernels discover edges, curves and textures automatically.
#
# RUN IT:  python 04_cnn-3.py
#

import numpy as np

I = np.array([[1, 2, 3, 1, 2, 3], [-1, 0, 3, 0, 1, 2], [1, 2, -3, 1, -1, 0],
              [-1, 2, 3, 0, -1, 3], [1, 0, -3, 1, 3, -2], [-2, 1, 0, 1, 2, 1]])
K = np.array([[0, 1, 0], [1, 0, 1], [1, 0, 1]])
out = np.array([[(I[r:r + 3, c:c + 3] * K).sum() for c in range(4)] for r in range(4)])
print(out.tolist())
print((I[0:3, 0:3] * K).sum(), (6 - 3) // 1 + 1)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[2, 6, 1, 5], [0, 8, -2, 5], [2, 0, 3, 1], [-2, 6, 2, 0]]
# 2 4
