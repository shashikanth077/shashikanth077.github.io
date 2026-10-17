# -*- coding: utf-8 -*-
# ==========================================================================
# One neuron: weighted sum, then activation [maths-ai / Putting it together:
# networks]
# ==========================================================================
# WHAT IT IS
# A neuron does two things. First a weighted sum of its inputs plus a bias, z
# = w·x + b — a dot product. Then it passes z through an activation function
# to get its output a = σ(z). Everything in a neural network is many copies of
# this.
#
# WHERE YOU USE IT
# A "layer" is just many neurons sharing the same inputs — which is a matrix
# multiplication.
#
# RUN IT:  python 01_nn-0.py
#

import math
x, w, b = [2, 3], [0.5, -1], 0.5
z = sum(xi * wi for xi, wi in zip(x, w)) + b
a = 1 / (1 + math.exp(-z))
print(z, round(a, 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# -1.5 0.1824
