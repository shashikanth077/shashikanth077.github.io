# -*- coding: utf-8 -*-
# ==========================================================================
# Training from scratch: batch gradient descent in NumPy [neural-networks /
# Gradient descent and backpropagation]
# ==========================================================================
# WHAT IT IS
# Put it all together without any framework. Four records (distance →
# minutes), w = 1, b = 2, learning rate 0.02, 300 epochs of batch gradient
# descent: for each record compute the prediction (forward), the error, the
# loss ½e² and the gradients error × x and error (chain rule), average them
# over the four records, then update w and b. The words in the lectures map to
# lines of code: forward pass → wx + b; loss → 0.5error2; backprop → dw +=
# errorx; gradient descent → w -= lr(dw/n); epoch → the outer loop.
#
# WHERE YOU USE IT
# This is batch gradient descent: the whole dataset forms one batch, so each
# epoch is one update. Frameworks use mini-batches and an optimiser class, but
# the arithmetic is the same.
#
# RUN IT:  python 10_learn-9.py
#

samples = [(1, 5), (2, 8), (3, 11), (4, 14)]
w, b = 1.0, 2.0
lr, epochs = 0.02, 300
for epoch in range(epochs):
    dw = db = total = 0.0
    for x, actual in samples:
        pred = w * x + b
        error = pred - actual
        total += 0.5 * error ** 2
        dw += error * x
        db += error
    n = len(samples)
    w -= lr * dw / n
    b -= lr * db / n
    if epoch % 100 == 0:
        print(epoch, round(total / n, 4), round(w, 3), round(b, 3))
print("Prediction at 5 km:", round(w * 5 + b, 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0 15.0 1.3 2.1
# 100 0.017 2.847 2.45
# 200 0.0094 2.886 2.334
# Prediction at 5 km: 16.83
