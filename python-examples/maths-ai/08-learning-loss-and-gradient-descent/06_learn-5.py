# -*- coding: utf-8 -*-
# ==========================================================================
# Momentum and Adam [maths-ai / Learning: loss and gradient descent]
# ==========================================================================
# WHAT IT IS
# Plain gradient descent forgets the past. Momentum keeps a running velocity —
# v = β·v + gradient — so steady directions speed up and zig-zags cancel, like
# a heavy ball rolling downhill. Adam also tracks the size of recent gradients
# and scales each weight's step separately. They usually reach a low loss in
# fewer steps.
#
# WHERE YOU USE IT
# Adam is the default optimiser for most deep-learning work; SGD with momentum
# remains common for vision.
#
# RUN IT:  python 06_learn-5.py
#

def run(lr, beta, steps=10):
    w, v = 0.0, 0.0
    for _ in range(steps):
        g = 2 * (w - 3)
        v = beta * v + g
        w -= lr * v
    return round((w - 3) ** 2, 4)

print(run(0.03, 0.0), run(0.03, 0.7))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2.611 0.0149
