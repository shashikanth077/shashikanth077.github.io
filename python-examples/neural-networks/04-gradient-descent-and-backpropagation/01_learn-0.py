# -*- coding: utf-8 -*-
# ==========================================================================
# The food-delivery story: learning y = w·x + b [neural-networks / Gradient
# descent and backpropagation]
# ==========================================================================
# WHAT IT IS
# A delivery app wants to predict minutes from distance. Records: 1 km → 5
# min, 2 → 8, 3 → 11, 4 → 14. The simplest model is one neuron: prediction ŷ =
# w × distance + b. The weight w is minutes per extra kilometre; the bias b is
# the fixed start-up time. Training means finding good w and b. (The classroom
# data follow 3 km + 2 min exactly; real deliveries also depend on traffic,
# weather and kitchen time.)
#
# WHERE YOU USE IT
# This one-neuron regression is the seed of every deep network: the same
# forward pass, loss, gradient and update just repeat across layers.
#
# RUN IT:  python 01_learn-0.py
#

import numpy as np

x = np.array([1, 2, 3, 4], dtype=float)
y = np.array([5, 8, 11, 14], dtype=float)
w, b = np.polyfit(x, y, 1)
print(round(float(w), 2), round(float(b), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3.0 2.0
