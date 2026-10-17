# -*- coding: utf-8 -*-
# ==========================================================================
# The dot product: a weighted score [maths-ai / Vectors]
# ==========================================================================
# WHAT IT IS
# Multiply matching components, then add: [x₁, x₂, x₃] · [w₁, w₂, w₃] = x₁w₁ +
# x₂w₂ + x₃w₃. The result is one number. A weight says how much an input
# matters; a negative weight pushes the answer down. Add a bias and you have a
# neuron's pre-activation.
#
# WHERE YOU USE IT
# Every dense layer, attention score and similarity search is built from dot
# products.
#
# RUN IT:  python 03_vec-2.py
#

x = [5, 7, 9]      # hours studied, hours slept, days attended
w = [4, 2, 0.5]    # how much each one matters
b = 10
score = sum(xi * wi for xi, wi in zip(x, w)) + b
print(score)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 48.5
