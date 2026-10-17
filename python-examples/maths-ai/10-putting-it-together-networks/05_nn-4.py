# -*- coding: utf-8 -*-
# ==========================================================================
# Backpropagation through a sigmoid neuron [maths-ai / Putting it together:
# networks]
# ==========================================================================
# WHAT IT IS
# Backpropagation is the chain rule run backwards. Forward: z = wx + b, a =
# σ(z), E = ½(a − t)². Backward: the slope of E with respect to w is the
# product of the slopes along the path — ∂E/∂a · ∂a/∂z · ∂z/∂w = (a − t) · a(1
# − a) · x. Then update w against that gradient.
#
# WHERE YOU USE IT
# Frameworks like PyTorch build this chain automatically (autograd); knowing
# the mechanics lets you debug vanishing gradients and shape errors.
#
# RUN IT:  python 05_nn-4.py
#

import math
x, w, b, t = 2, 0.5, 0.0, 1
z = w * x + b
a = 1 / (1 + math.exp(-z))
E = 0.5 * (a - t) ** 2
dE_da = a - t
da_dz = a * (1 - a)
dE_dw = dE_da * da_dz * x
print(round(z, 3), round(a, 4), round(E, 4))
print(round(dE_dw, 4))
w = w - 0.5 * dE_dw
print(round(w, 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.0 0.7311 0.0362
# -0.1058
# 0.5529
