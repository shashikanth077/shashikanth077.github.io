# -*- coding: utf-8 -*-
# ==========================================================================
# The whole training loop [maths-ai / Putting it together: networks]
# ==========================================================================
# WHAT IT IS
# Training repeats one cycle: forward pass (predict), loss (how wrong),
# backward pass (gradients by the chain rule), update (step against the
# gradient). Over many epochs the loss falls. Every algorithm in this track —
# linear regression to Transformers — is this loop with different layers.
#
# WHERE YOU USE IT
# If you can write this loop from scratch, you understand what frameworks like
# PyTorch do for you.
#
# RUN IT:  python 11_nn-10.py
#

xs, ys = [1, 2, 3], [3, 5, 7]          # y = 2x + 1
w, b, lr = 0.0, 0.0, 0.05
for epoch in range(3):
    gw = gb = 0
    for x, y in zip(xs, ys):
        err = (w * x + b) - y
        gw += 2 * err * x / len(xs)
        gb += 2 * err / len(xs)
    w, b = w - lr * gw, b - lr * gb
    loss = sum(((w * x + b) - y) ** 2 for x, y in zip(xs, ys)) / len(xs)
    print(epoch + 1, round(w, 3), round(b, 3), round(loss, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 1.133 0.5 5.489
# 2 1.638 0.723 1.09
# 3 1.862 0.823 0.217
