# -*- coding: utf-8 -*-
# ==========================================================================
# Parameters and shapes: counting the weights [neural-networks / Why neural
# networks]
# ==========================================================================
# WHAT IT IS
# A dense layer with n_in inputs and n_out neurons has n_in × n_out weights
# and n_out biases: n_in × n_out + n_out parameters. Each neuron has its own
# bias. For 3 inputs → 4 hidden → 2 outputs: (3 × 4 + 4) + (4 × 2 + 2) = 16 +
# 10 = 26. Shapes tell you the same story: an input batch of 8 examples with 3
# features is (8, 3); times a (3, 4) weight matrix plus a bias of 4 gives (8,
# 4).
#
# WHERE YOU USE IT
# Counting parameters is the quickest sanity check on a model summary and a
# favourite exam question.
#
# RUN IT:  python 04_start-4.py
#

import numpy as np

X = np.ones((8, 3))
W1, b1 = np.zeros((3, 4)), np.zeros(4)
W2, b2 = np.zeros((4, 2)), np.zeros(2)
H = X @ W1 + b1
out = H @ W2 + b2
print(X.shape, H.shape, out.shape)
print(W1.size + b1.size, W2.size + b2.size, W1.size + b1.size + W2.size + b2.size)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (8, 3) (8, 4) (8, 2)
# 16 10 26
