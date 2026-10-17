# -*- coding: utf-8 -*-
# ==========================================================================
# Pooling: keep the strongest evidence [neural-networks / Convolutional
# networks]
# ==========================================================================
# WHAT IT IS
# Pooling shrinks height and width without learned weights. A 2×2 window with
# stride 2 keeps the maximum (max pooling) or the mean (average pooling). On
# the lecture's 6×6 input, max pooling gives [[2,3,3],[2,3,3],[1,1,3]] and
# average pooling [[0.5,1.75,2],[1,0.25,0.25],[0,−0.25,1]]. Max pooling
# preserves the strongest detection in each block and discards its exact
# position, giving limited tolerance to small shifts — not perfect invariance
# to every change.
#
# WHERE YOU USE IT
# Pooling has zero parameters; global average pooling can replace Flatten to
# shrink the dense layer.
#
# RUN IT:  python 08_cnn-7.py
#

import numpy as np

I = np.array([[1, 2, 3, 1, 2, 3], [-1, 0, 3, 0, 1, 2], [1, 2, -3, 1, -1, 0],
              [-1, 2, 3, 0, -1, 3], [1, 0, -3, 1, 3, -2], [-2, 1, 0, 1, 2, 1]])
K = np.array([[0, 1, 0], [1, 0, 1], [1, 0, 1]])
blocks = I.reshape(3, 2, 3, 2)
print(blocks.max(axis=(1, 3)).tolist())
print(blocks.mean(axis=(1, 3)).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[2, 3, 3], [2, 3, 3], [1, 1, 3]]
# [[0.5, 1.75, 2.0], [1.0, 0.25, 0.25], [0.0, -0.25, 1.0]]
