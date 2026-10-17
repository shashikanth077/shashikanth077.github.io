# -*- coding: utf-8 -*-
# ==========================================================================
# The artificial neuron [machine-learning / Neural networks]
# ==========================================================================
# WHAT IT IS
# A neuron is a small calculator: multiply each input by a weight, add a bias,
# pass the sum through an activation function. z = w₁x₁ + w₂x₂ + w₃x₃ + b, y =
# f(z). With x = (1, 0.5, 0.8), w = (2, 1, 3), b = −2: z = 2 + 0.5 + 2.4 − 2 =
# 2.9 and sigmoid(2.9) ≈ 0.948 — a 94.8% urgency probability; at threshold 0.5
# the output is Urgent. The bias shifts the activation curve so a neuron can
# fire even when the weighted inputs start away from zero. Drag the weights.
#
# WHERE YOU USE IT
# Training is just choosing w and b so the outputs match the labels.
# Everything else in a network is many of these neurons arranged in layers.
#
# RUN IT:  python 01_nn-0.py
#

import numpy as np

sigmoid = lambda z: 1 / (1 + np.exp(-z))
x, w, b = np.array([1, 0.5, 0.8]), np.array([2, 1, 3]), -2
z = float(w @ x + b)
print(round(z, 2), round(float(sigmoid(z)), 3))
x2, w2, b2 = np.array([2, 1]), np.array([0.4, -0.2]), 0.1
z2 = float(w2 @ x2 + b2)
print(round(z2, 2), round(float(sigmoid(z2)), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2.9 0.948
# 0.7 0.6682
