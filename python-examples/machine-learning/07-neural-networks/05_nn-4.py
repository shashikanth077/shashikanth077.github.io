# -*- coding: utf-8 -*-
# ==========================================================================
# Loss and one gradient step [machine-learning / Neural networks]
# ==========================================================================
# WHAT IT IS
# Training needs a number that says how wrong the prediction is: the loss. For
# one sigmoid output and label y, binary cross-entropy is L = −[y ln p + (1 −
# y) ln(1 − p)]. Backpropagation computes how the loss changes with each
# weight and an optimiser moves the weights downhill. For one sigmoid unit
# with y = 1 the gradient is (p − y)·x. With x = (2, 1), w = (0.4, −0.2), b =
# 0.1: z = 0.7, p = 0.6682, gradient (−0.6636, −0.3318); with learning rate
# 0.1, w_new = (0.4664, −0.1668) and b_new = 0.1332 — the prediction moves
# toward 1.
#
# WHERE YOU USE IT
# This is one output unit, not a whole multilayer network; deeper layers apply
# the chain rule to pass the error backwards.
#
# RUN IT:  python 05_nn-4.py
#

import numpy as np

sigmoid = lambda z: 1 / (1 + np.exp(-z))
x, w, b, y, lr = np.array([2.0, 1.0]), np.array([0.4, -0.2]), 0.1, 1, 0.1
p = sigmoid(w @ x + b)
loss = -(y * np.log(p) + (1 - y) * np.log(1 - p))
grad_w = (p - y) * x
grad_b = p - y
print(round(float(p), 4), round(float(loss), 4))
print(grad_w.round(4).tolist(), round(float(grad_b), 4))
print((w - lr * grad_w).round(4).tolist(), round(float(b - lr * grad_b), 4))
p2 = sigmoid((w - lr * grad_w) @ x + (b - lr * grad_b))
print(round(float(p2), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.6682 0.4032
# [-0.6636, -0.3318] -0.3318
# [0.4664, -0.1668] 0.1332
# 0.7108
