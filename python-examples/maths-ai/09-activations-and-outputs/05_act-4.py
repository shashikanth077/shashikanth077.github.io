# -*- coding: utf-8 -*-
# ==========================================================================
# Derivatives of activations and vanishing gradients [maths-ai / Activations
# and outputs]
# ==========================================================================
# WHAT IT IS
# Backpropagation multiplies by each activation's slope. The sigmoid's slope
# σ(1 − σ) is at most 0.25 and almost 0 at the ends — multiply many such small
# numbers through a deep network and the gradient vanishes, so early layers
# stop learning. ReLU's slope is 1 for positive inputs, which is why it trains
# deep networks so much better.
#
# WHERE YOU USE IT
# Vanishing gradients are why sigmoid was replaced by ReLU in hidden layers,
# and why residual connections and normalisation exist.
#
# RUN IT:  python 05_act-4.py
#

import math
sigmoid = lambda z: 1 / (1 + math.exp(-z))
for z in [0, 2, 6]:
    s = sigmoid(z)
    print(z, round(s * (1 - s), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0 0.25
# 2 0.105
# 6 0.0025
