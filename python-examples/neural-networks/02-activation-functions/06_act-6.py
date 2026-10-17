# -*- coding: utf-8 -*-
# ==========================================================================
# Saturation and the slope of an activation [neural-networks / Activation
# functions]
# ==========================================================================
# WHAT IT IS
# Learning multiplies gradients, and every activation contributes its local
# slope. Sigmoid's slope is σ(z)(1 − σ(z)): at most 0.25 (at z = 0) and tiny
# for large |z| (0.018 at z = 4). Tanh's slope 1 − tanh²(z) peaks at 1. ReLU's
# slope is exactly 1 for positive z. Multiply many numbers below 1 through
# many layers and the gradient shrinks towards zero — the vanishing-gradient
# problem — which is one reason ReLU replaced sigmoid in deep hidden layers.
# Drag z to read the three slopes.
#
# WHERE YOU USE IT
# Saturated units (|z| large) barely change when their weights change, so they
# learn slowly. Initialisation, normalisation and ReLU all help.
#
# RUN IT:  python 06_act-6.py
#

import numpy as np

sigmoid = lambda z: 1 / (1 + np.exp(-z))
for z in (0.0, 2.0, 4.0):
    s = sigmoid(z)
    print(z, round(float(s * (1 - s)), 4), round(float(1 - np.tanh(z) ** 2), 4), int(z > 0))
print(round(0.25 ** 10, 8))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.0 0.25 1.0 0
# 2.0 0.105 0.0707 1
# 4.0 0.0177 0.0013 1
# 9.5e-07
