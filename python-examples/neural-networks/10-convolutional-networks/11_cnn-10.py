# -*- coding: utf-8 -*-
# ==========================================================================
# CNNs for text: embeddings → Conv1D [neural-networks / Convolutional
# networks]
# ==========================================================================
# WHAT IT IS
# For IMDb reviews: tokens → Embedding → Conv1D + ReLU → pooling → dense →
# sigmoid. A Conv1D kernel of width 2–5 slides over the sequence of embedding
# vectors, like looking at 2–5 consecutive words at once. With 200 tokens,
# kernel 5: 200 − 5 + 1 = 196 positions; 100 filters over embedding dimension
# 8 → 5×8×100 + 100 = 4,100 parameters. The model sees numeric vectors, never
# strings. When predicting new text, reuse the same vocabulary and
# preprocessing.
#
# WHERE YOU USE IT
# Fit any vocabulary on training text only; do not invent a new token-ID
# mapping at prediction time.
#
# RUN IT:  python 11_cnn-10.py
#

import numpy as np

rng = np.random.default_rng(0)
x = rng.normal(size=(200, 8))
w = rng.normal(size=(5, 8, 100))
out = np.array([[np.sum(x[i:i + 5] * w[:, :, f]) for f in range(100)] for i in range(196)])
print(out.shape, w.size + 100)
print(np.maximum(out, 0).max(axis=0).shape)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (196, 100) 4100
# (100,)
