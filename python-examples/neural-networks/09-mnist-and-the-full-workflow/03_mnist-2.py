# -*- coding: utf-8 -*-
# ==========================================================================
# Shapes through the network [neural-networks / MNIST and the full workflow]
# ==========================================================================
# WHAT IT IS
# A dimension is a direction in an array, not a neuron. One raw MNIST image is
# (28, 28); a batch of 32 is (32, 28, 28); adding a grayscale channel gives
# (32, 28, 28, 1). Flatten → (32, 784). Dense(100) → (32, 100): 100 learned
# features. Dense(10) → (32, 10): ten class scores. In Keras the batch size
# shows as None (variable). Always keep the batch axis first and check shapes
# before debugging anything else.
#
# WHERE YOU USE IT
# Most beginner shape errors are a missing channel axis or flattening the
# batch axis by mistake.
#
# RUN IT:  python 03_mnist-2.py
#

import numpy as np

rng = np.random.default_rng(0)
x = rng.random((32, 28, 28, 1))
flat = x.reshape(32, -1)
W1, b1 = rng.normal(0, 0.05, (784, 100)), np.zeros(100)
W2, b2 = rng.normal(0, 0.05, (100, 10)), np.zeros(10)
h = 1 / (1 + np.exp(-(flat @ W1 + b1)))
out = h @ W2 + b2
print(x.shape, flat.shape, h.shape, out.shape)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (32, 28, 28, 1) (32, 784) (32, 100) (32, 10)
