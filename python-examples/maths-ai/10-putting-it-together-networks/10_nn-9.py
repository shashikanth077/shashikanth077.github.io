# -*- coding: utf-8 -*-
# ==========================================================================
# Initialisation and keeping training stable [maths-ai / Putting it together:
# networks]
# ==========================================================================
# WHAT IT IS
# Start the weights too small and signals shrink to nothing layer by layer;
# too large and they explode. Initialisation chooses the spread so the signal
# keeps about the same size: with n inputs, a weight standard deviation of
# about 1/√n keeps the output variance near 1. Normalisation layers and
# L2/dropout regularisation keep it stable during training.
#
# WHERE YOU USE IT
# Xavier/He initialisation, batch/layer normalisation and gradient clipping
# are standard tools for stable deep-network training.
#
# RUN IT:  python 10_nn-9.py
#

import math
n = 100
for sigma in [0.01, 0.1, 0.3]:
    print(sigma, round(n * sigma ** 2, 3))
print(round(1 / math.sqrt(n), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.01 0.01
# 0.1 1.0
# 0.3 9.0
# 0.1
