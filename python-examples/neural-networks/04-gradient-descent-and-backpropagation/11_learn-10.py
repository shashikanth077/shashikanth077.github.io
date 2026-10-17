# -*- coding: utf-8 -*-
# ==========================================================================
# A whole network from scratch: learning XOR [neural-networks / Gradient
# descent and backpropagation]
# ==========================================================================
# WHAT IT IS
# XOR (output 1 when exactly one input is 1) cannot be solved by one neuron —
# no straight line separates the classes — but a network with ONE hidden layer
# of two sigmoid neurons can. The code trains a 2 → 2 → 1 network with plain
# NumPy: forward pass, binary cross-entropy, backpropagation through both
# layers (output gradient p − y, then through the hidden sigmoid with a(1 −
# a)), and gradient descent for 8,000 epochs. After training the four outputs
# are close to 0, 1, 1, 0 — the hidden layer has built the feature the output
# neuron needed.
#
# WHERE YOU USE IT
# This is the smallest demonstration that hidden layers + non-linear
# activations add real power. Different random seeds can need different
# training lengths.
#
# RUN IT:  python 11_learn-10.py
#

import numpy as np

rng = np.random.default_rng(0)
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
y = np.array([[0], [1], [1], [0]], dtype=float)
sigmoid = lambda z: 1 / (1 + np.exp(-z))
W1, b1 = rng.normal(0, 1, (2, 2)), np.zeros(2)
W2, b2 = rng.normal(0, 1, (2, 1)), np.zeros(1)
for epoch in range(8000):
    a1 = sigmoid(X @ W1 + b1)
    p = sigmoid(a1 @ W2 + b2)
    dz2 = (p - y) / len(X)
    dW2, db2 = a1.T @ dz2, dz2.sum(axis=0)
    dz1 = (dz2 @ W2.T) * a1 * (1 - a1)
    dW1, db1 = X.T @ dz1, dz1.sum(axis=0)
    W2 -= 1.0 * dW2
    b2 -= 1.0 * db2
    W1 -= 1.0 * dW1
    b1 -= 1.0 * db1
p = sigmoid(sigmoid(X @ W1 + b1) @ W2 + b2)
print(p.ravel().round(3).tolist(), (p.ravel() > 0.5).astype(int).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.001, 0.999, 0.998, 0.001] [0, 1, 1, 0]
