# -*- coding: utf-8 -*-
# ==========================================================================
# Activation functions [machine-learning / Neural networks]
# ==========================================================================
# WHAT IT IS
# The activation f(z) makes the network non-linear. Step: 0 or 1 (the classic
# perceptron). Sigmoid: 1/(1 + e⁻ᶻ), between 0 and 1 — a probability for a
# binary output. tanh: between −1 and +1, centred on zero. ReLU: max(0, z),
# the usual hidden-layer choice because it is cheap and does not saturate for
# positive z. Without non-linear activations, stacked layers would collapse to
# one linear layer. Drag z to read every function at once.
#
# WHERE YOU USE IT
# Sigmoid and tanh flatten for large |z|, so gradients vanish; ReLU units can
# "die" if they stay negative.
#
# RUN IT:  python 02_nn-1.py
#

import numpy as np

z = 1.5
print(int(z > 0), round(float(1 / (1 + np.exp(-z))), 3), round(float(np.tanh(z)), 3), max(0, z))
print(max(0, -1.5), round(float(np.tanh(-1.5)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 0.818 0.905 1.5
# 0 -0.905
