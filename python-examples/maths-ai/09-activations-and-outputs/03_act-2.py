# -*- coding: utf-8 -*-
# ==========================================================================
# ReLU, tanh and Leaky ReLU [maths-ai / Activations and outputs]
# ==========================================================================
# WHAT IT IS
# ReLU, max(0, z), zeroes out negatives and passes positives unchanged —
# cheap, and its slope is 1 for positive inputs, so gradients flow. Tanh
# squashes to between −1 and 1 and is centred on 0. Leaky ReLU keeps a small
# slope for negatives so a neuron cannot "die" at zero.
#
# WHERE YOU USE IT
# ReLU (and variants such as GELU) is the default hidden-layer activation;
# tanh appears in recurrent networks.
#
# RUN IT:  python 03_act-2.py
#

import math
for z in [-2, 0, 2]:
    print(z, max(0, z), round(math.tanh(z), 3), z if z >= 0 else 0.1 * z)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# -2 0 -0.964 -0.2
# 0 0 0.0 0
# 2 2 0.964 2
