# -*- coding: utf-8 -*-
# ==========================================================================
# Gradient descent in motion [neural-networks / Gradient descent and
# backpropagation]
# ==========================================================================
# WHAT IT IS
# new weight = old weight − learning rate × gradient, for every parameter,
# repeated. With the single record (3 km → 11 min), starting at w = 1, b = 2
# and learning rate 0.05, each step shrinks the error by half (the loss by a
# factor of four): 18 → 4.5 → 1.125 → 0.28 … Slide through the iterations and
# watch the loss fall. Many (w, b) pairs fit a single point, so real training
# uses many examples.
#
# WHERE YOU USE IT
# Convergence is judged on validation data, not by driving one example's loss
# to zero.
#
# RUN IT:  python 06_learn-5.py
#

w, b, x, y, lr = 1.0, 2.0, 3.0, 11.0, 0.05
for it in range(5):
    e = w * x + b - y
    print(it, round(w, 3), round(b, 3), round(0.5 * e * e, 4))
    w -= lr * e * x
    b -= lr * e

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0 1.0 2.0 18.0
# 1 1.9 2.3 4.5
# 2 2.35 2.45 1.125
# 3 2.575 2.525 0.2812
# 4 2.688 2.562 0.0703
