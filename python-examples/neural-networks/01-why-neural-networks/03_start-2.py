# -*- coding: utf-8 -*-
# ==========================================================================
# Layers and the forward pass: one student, one prediction [neural-networks /
# Why neural networks]
# ==========================================================================
# WHAT IT IS
# Chain neurons into layers. Student (0.8, 0.9) → hidden ReLU neuron (weights
# 0.5, 0.4, bias 0.1) → output sigmoid neuron (weight 2, bias −0.2). Hidden: z
# = 0.86, a = 0.86. Output: z = 0.86 × 2 − 0.2 = 1.52, and sigmoid(1.52) =
# 1/(1 + e⁻¹·⁵²) ≈ 0.8205: an 82.05% chance of passing. The student really
# passed (y = 1), so the binary cross-entropy is −ln(0.8205) ≈ 0.1978. This
# left-to-right calculation is the forward pass.
#
# WHERE YOU USE IT
# The weights here are invented for the arithmetic; trained weights come from
# many labelled examples.
#
# RUN IT:  python 03_start-2.py
#

import numpy as np

x = np.array([0.8, 0.9])
z_hidden = x @ np.array([0.5, 0.4]) + 0.1
h = max(0.0, z_hidden)
z_out = h * 2.0 - 0.2
p = 1 / (1 + np.exp(-z_out))
loss = -np.log(p)
print(round(float(z_hidden), 2), round(float(z_out), 2))
print(round(float(p), 4), round(float(loss), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.86 1.52
# 0.8205 0.1978
