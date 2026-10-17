# -*- coding: utf-8 -*-
# ==========================================================================
# The neuron: weighted sum, bias, activation [neural-networks / Why neural
# networks]
# ==========================================================================
# WHAT IT IS
# A neuron is a small calculator. It multiplies each input by a weight, adds
# them up with a bias to get the score z = w₁x₁ + w₂x₂ + b, then passes z
# through an activation function: a = f(z). Take a student with study 0.8 and
# attendance 0.9 (both scaled 0–1): with weights 0.5 and 0.4 and bias 0.1, z =
# 0.8×0.5 + 0.9×0.4 + 0.1 = 0.86, and ReLU keeps it: a = 0.86. Drag the
# weights and watch the score change. Note: this z is a raw score, not a
# statistics Z-score.
#
# WHERE YOU USE IT
# Weights are learned, not fixed importance ratings. The bias lets a neuron
# fire even when all inputs are zero.
#
# RUN IT:  python 02_start-1.py
#

import numpy as np

x = np.array([0.8, 0.9])
w = np.array([0.5, 0.4])
b = 0.1
print((x * w).round(2).tolist())
z = float(x @ w + b)
print(round(z, 2), max(0.0, z))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.4, 0.36]
# 0.86 0.86
