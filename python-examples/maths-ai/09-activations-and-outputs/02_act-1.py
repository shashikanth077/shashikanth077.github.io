# -*- coding: utf-8 -*-
# ==========================================================================
# Sigmoid: squashing into 0 to 1 [maths-ai / Activations and outputs]
# ==========================================================================
# WHAT IT IS
# The sigmoid σ(z) = 1/(1 + e⁻ᶻ) maps any real number to between 0 and 1:
# large negative inputs go near 0, large positive near 1, and 0 maps to 0.5.
# That makes it a natural output for a probability. Its drawback: at both ends
# the curve is almost flat, so gradients nearly vanish.
#
# WHERE YOU USE IT
# Binary classifiers end in a sigmoid to turn a score into a probability.
#
# RUN IT:  python 02_act-1.py
#

import math
sigmoid = lambda z: 1 / (1 + math.exp(-z))
for z in [-4, 0, 1, 4]:
    print(z, round(sigmoid(z), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# -4 0.018
# 0 0.5
# 1 0.731
# 4 0.982
