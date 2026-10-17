# -*- coding: utf-8 -*-
# ==========================================================================
# Derivatives of e^x, ln x and the sigmoid [maths-ai / Calculus: change and
# slope]
# ==========================================================================
# WHAT IT IS
# The exponential is its own slope: (eˣ)′ = eˣ. The log: (ln x)′ = 1/x. A
# chain gives (e⁻ˣ)′ = −e⁻ˣ. For the sigmoid σ(z) = 1/(1 + e⁻ᶻ) the derivative
# is wonderfully simple: σ′(z) = σ(z)(1 − σ(z)), at most 0.25.
#
# WHERE YOU USE IT
# Softmax, sigmoid and cross-entropy all contain exponentials and logs; their
# tidy derivatives make backpropagation cheap.
#
# RUN IT:  python 06_calc-5.py
#

import math
sigmoid = lambda z: 1 / (1 + math.exp(-z))
s = sigmoid(1)
print(round(s, 4), round(s * (1 - s), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.7311 0.1966
