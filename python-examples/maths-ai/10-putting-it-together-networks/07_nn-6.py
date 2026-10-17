# -*- coding: utf-8 -*-
# ==========================================================================
# Forward pass through a small network [maths-ai / Putting it together:
# networks]
# ==========================================================================
# WHAT IT IS
# A network is layers of matrix multiplications with activations between them.
# For two inputs and two hidden units, compute h = ReLU(xW₁ + b₁), then the
# output y = h · W₂. Track the shapes: (1×2)(2×2) = (1×2), then (1×2)(2×1) =
# (1×1).
#
# WHERE YOU USE IT
# This is exactly what the forward pass of any feed-forward network does, with
# bigger matrices.
#
# RUN IT:  python 07_nn-6.py
#

relu = lambda v: [max(0, a) for a in v]
x = [1, 2]
W1 = [[0.5, -1], [1, 0.5]]
b1 = [0.5, -0.5]
h = relu([sum(xi * W1[i][j] for i, xi in enumerate(x)) + b1[j] for j in range(2)])
W2 = [1, 2]
y = sum(hj * wj for hj, wj in zip(h, W2))
print(h, y)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [3.0, 0] 3.0
