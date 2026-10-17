# -*- coding: utf-8 -*-
# ==========================================================================
# Predicting a brand-new image correctly [neural-networks / MNIST and the full
# workflow]
# ==========================================================================
# WHAT IT IS
# A new PNG must go through EXACTLY the same pipeline as training: convert to
# grayscale, resize to 28 × 28, match the polarity (MNIST is light digit on
# dark background — invert a dark-on-white scan), divide by 255, add the
# channel (and batch) axes, call predict, and read argmax of the 10
# probabilities. Typical mistakes: forgetting to scale, feeding (28, 28)
# instead of (1, 28, 28, 1), or not inverting the colours. Check the output
# shape (1, 10) and that the probabilities sum to 1.
#
# WHERE YOU USE IT
# A confident wrong answer on a hand-drawn digit often means a preprocessing
# mismatch, not a bad model.
#
# RUN IT:  python 07_mnist-6.py
#

import numpy as np

rng = np.random.default_rng(1)
scan = 255 - (rng.random((28, 28)) * 60).astype(np.uint8)
scan[:, 13:15] = 20
x = (255 - scan) / 255.0
x = x[None, :, :, None]
print(x.shape, round(float(x.min()), 2), round(float(x.max()), 2))
logits = rng.normal(0, 1, 10)
p = np.exp(logits - logits.max())
p /= p.sum()
print(p.shape, round(float(p.sum()), 3), int(p.argmax()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (1, 28, 28, 1) 0.0 0.92
# (10,) 1.0 9
