# -*- coding: utf-8 -*-
# ==========================================================================
# Tanh: a centred, signed signal [neural-networks / Activation functions]
# ==========================================================================
# WHAT IT IS
# tanh(z) = (eᶻ − e⁻ᶻ) / (eᶻ + e⁻ᶻ) squashes into (−1, +1) and is centred on
# zero: negative inputs give negative outputs. It is a rescaled sigmoid:
# tanh(z) = 2σ(2z) − 1. A neuron with a tanh activation can pass negative
# evidence (a review leaning negative) as well as positive. Those are internal
# signals, not calibrated probabilities. Like sigmoid it saturates for large
# |z|. It is still used in recurrent networks.
#
# WHERE YOU USE IT
# Zero-centred activations can make optimisation slightly easier than sigmoid
# in hidden layers; ReLU has largely replaced both there.
#
# RUN IT:  python 03_act-2.py
#

import numpy as np

sigmoid = lambda z: 1 / (1 + np.exp(-z))
for z in (-2.0, 0.0, 1.0, 2.0):
    print(z, round(float(np.tanh(z)), 4), round(float(2 * sigmoid(2 * z) - 1), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# -2.0 -0.964 -0.964
# 0.0 0.0 0.0
# 1.0 0.7616 0.7616
# 2.0 0.964 0.964
