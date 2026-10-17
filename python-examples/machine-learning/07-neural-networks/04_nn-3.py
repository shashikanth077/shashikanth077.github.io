# -*- coding: utf-8 -*-
# ==========================================================================
# Multilayer perceptron: the forward pass [machine-learning / Neural networks]
# ==========================================================================
# WHAT IT IS
# An MLP stacks layers: input → hidden layer(s) → output. Each layer
# multiplies by a weight matrix, adds a bias and applies an activation; the
# output feeds the next layer. This is the forward pass. Tiny example, 2
# inputs → 2 ReLU hidden units → 1 sigmoid output: the hidden pre-activations
# are (0.75, −0.2); ReLU keeps (0.75, 0); the output score is 0.95 and the
# probability 0.721. "Deep" learning means many such learned layers.
#
# WHERE YOU USE IT
# All weights start random; training adjusts them. Shapes are the main
# debugging tool: (n_inputs × n_hidden), then (n_hidden × n_outputs).
#
# RUN IT:  python 04_nn-3.py
#

import numpy as np

x = np.array([1.0, 0.5])
W1 = np.array([[0.5, -0.4], [0.3, 0.8]])
b1 = np.array([0.1, -0.2])
z1 = x @ W1 + b1
a1 = np.maximum(0, z1)
W2 = np.array([[1.0], [-1.5]])
b2 = np.array([0.2])
z2 = a1 @ W2 + b2
p = 1 / (1 + np.exp(-z2))
print(z1.tolist(), a1.tolist())
print(z2.tolist(), round(float(p[0]), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.75, -0.2] [0.75, 0.0]
# [0.95] 0.7211
