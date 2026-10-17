# -*- coding: utf-8 -*-
# ==========================================================================
# The learning rate: too small, just right, too big [maths-ai / Learning: loss
# and gradient descent]
# ==========================================================================
# WHAT IT IS
# On this bowl each step multiplies the distance to the minimum by (1 − 2η).
# Small η: safe but slow. A good η: fast and smooth. η = 1: it bounces forever
# between two points. η above 1: each step overshoots further and the loss
# explodes. Choosing the learning rate is the most common tuning job in ML.
#
# WHERE YOU USE IT
# A loss that suddenly becomes NaN or shoots up is usually a learning rate
# that is too high.
#
# RUN IT:  python 03_learn-2.py
#

def run(lr, steps=8):
    w = 0.0
    for _ in range(steps):
        w -= lr * 2 * (w - 3)
    return round(w, 3)

for lr in [0.05, 0.4, 1.0, 1.1]:
    print(lr, run(lr))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.05 1.709
# 0.4 3.0
# 1.0 0.0
# 1.1 -9.899
