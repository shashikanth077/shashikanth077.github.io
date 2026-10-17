# -*- coding: utf-8 -*-
# ==========================================================================
# Local minima, saddles and flat regions [maths-ai / Learning: loss and
# gradient descent]
# ==========================================================================
# WHAT IT IS
# Real loss surfaces are bumpy. Gradient descent follows the slope downhill,
# so where it ends depends on where it starts: it can settle in a shallower
# valley (a local minimum) instead of the deepest one. Flat regions give tiny
# gradients and slow progress, and saddle points are flat but not minima. In
# very high dimensions most trouble spots are saddles, which is why noise from
# mini-batches helps.
#
# WHERE YOU USE IT
# Different random initialisations lead to different trained models; that is
# why results vary between runs.
#
# RUN IT:  python 04_learn-3.py
#

grad = lambda x: 4 * x**3 - 4 * x + 0.5

def descend(x, lr=0.05, steps=200):
    for _ in range(steps):
        x -= lr * grad(x)
    return round(x, 3)

print(descend(1.5), descend(-1.5))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.93 -1.057
