# -*- coding: utf-8 -*-
# ==========================================================================
# 1-D convolution: slide a small window [neural-networks / Convolutional
# networks]
# ==========================================================================
# WHAT IT IS
# Start with a signal: sensor readings, audio samples, or word embeddings
# along a sentence. A kernel slides along it, computing a weighted sum at each
# stop. Signal [1, 2, 4, 5, 77, 11, 109] with kernel [0.2, 0.2, 0.2] gives
# 1.4, 2.2, 17.2, 18.6, 39.4 — a smoothing filter (note how it dilutes the
# spike 77). Deep-learning libraries implement cross-correlation (no kernel
# flip) and call it convolution. Output length = n − k + 1 = 7 − 3 + 1 = 5
# with no padding.
#
# WHERE YOU USE IT
# Conv1D is the text and time-series version of the same idea.
#
# RUN IT:  python 03_cnn-2.py
#

import numpy as np

s = np.array([1, 2, 4, 5, 77, 11, 109], dtype=float)
k = np.array([0.2, 0.2, 0.2])
out = [float(s[i:i + 3] @ k) for i in range(len(s) - 2)]
print(np.round(out, 2).tolist(), len(out))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [1.4, 2.2, 17.2, 18.6, 39.4] 5
