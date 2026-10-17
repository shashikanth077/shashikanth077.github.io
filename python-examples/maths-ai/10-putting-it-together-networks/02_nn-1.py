# -*- coding: utf-8 -*-
# ==========================================================================
# Linear regression: one training step by hand [maths-ai / Putting it
# together: networks]
# ==========================================================================
# WHAT IT IS
# One neuron, one example, no tricks. Predict, measure the loss, find the
# gradient with the chain rule, update. Target 10 for input x = 2, starting at
# w = 1, b = 0, learning rate 0.05: the prediction jumps from 2 to 6 and the
# loss falls from 64 to 16 in a single step. Repeat thousands of times and you
# have training.
#
# WHERE YOU USE IT
# Every optimiser step — however huge the model — is this same four-stage
# recipe.
#
# RUN IT:  python 02_nn-1.py
#

x, t = 2, 10
w, b, lr = 1.0, 0.0, 0.05
pred = w * x + b
loss = (pred - t) ** 2
dp = 2 * (pred - t)
gw, gb = dp * x, dp * 1
w, b = w - lr * gw, b - lr * gb
print(pred, loss, gw, gb)
print(w, b, w * x + b, ((w * x + b) - t) ** 2)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2.0 64.0 -32.0 -16.0
# 2.6 0.8 6.0 16.0
