# -*- coding: utf-8 -*-
# ==========================================================================
# Gradient descent, one step at a time [maths-ai / Learning: loss and gradient
# descent]
# ==========================================================================
# WHAT IT IS
# Gradient descent walks downhill. At the current weight, find the slope of
# the loss, then step the opposite way: w_new = w − η · slope. The learning
# rate η sets the step size. Repeat — each step lowers the loss until you
# reach the bottom. The minus sign is what turns "uphill direction" into
# "downhill step".
#
# WHERE YOU USE IT
# This is how every neural network learns: compute the gradient, take a small
# step against it, repeat — millions of times.
#
# RUN IT:  python 02_learn-1.py
#

w, lr = 0.0, 0.1
for step in range(5):
    grad = 2 * (w - 3)
    w -= lr * grad
    print(step + 1, round(w, 4), round((w - 3) ** 2, 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 0.6 5.76
# 2 1.08 3.6864
# 3 1.464 2.3593
# 4 1.7712 1.5099
# 5 2.017 0.9664
