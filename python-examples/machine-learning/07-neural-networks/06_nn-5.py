# -*- coding: utf-8 -*-
# ==========================================================================
# The training loop: gradient descent in action [machine-learning / Neural
# networks]
# ==========================================================================
# WHAT IT IS
# Training repeats four moves: forward pass → loss → backpropagation → update.
# Here the smallest possible network (one sigmoid neuron: p = σ(w·x + b))
# learns to separate x = 1, 2, 3 (class 0) from x = 4, 5, 6 (class 1) by
# gradient descent with learning rate 0.5. Drag the epoch: at the start the
# curve is flat at 0.5; the transition sharpens and moves between 3 and 4
# while the loss falls.
#
# WHERE YOU USE IT
# Plot the loss every run: a falling curve means learning; a flat or exploding
# curve points at the learning rate or the data.
#
# RUN IT:  python 06_nn-5.py
#

import numpy as np

x = np.array([1, 2, 3, 4, 5, 6], dtype=float)
y = np.array([0, 0, 0, 1, 1, 1], dtype=float)
w = b = 0.0
for epoch in range(101):
    p = 1 / (1 + np.exp(-(w * x + b)))
    if epoch in (0, 1, 3, 10, 30, 100):
        loss = -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))
        print(epoch, round(float(w), 3), round(float(b), 3), round(float(loss), 3))
    w -= 0.5 * np.mean((p - y) * x)
    b -= 0.5 * np.mean(p - y)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0 0.0 0.0 0.693
# 1 0.375 0.0 0.648
# 3 0.281 -0.197 0.582
# 10 0.38 -0.72 0.501
# 30 0.67 -1.852 0.364
# 100 1.25 -4.034 0.212
