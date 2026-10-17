# -*- coding: utf-8 -*-
# ==========================================================================
# Functions and graphs [maths-ai / Numbers, algebra and notation]
# ==========================================================================
# WHAT IT IS
# A function is a machine: put in x, the same rule always gives out one y. To
# draw it, pick several x values, compute each y, plot the points (x, y) and
# join them. A whole neural network is one big function built from small ones.
#
# WHERE YOU USE IT
# Think of a model as ŷ = f(x): the picture of f is what training reshapes.
#
# RUN IT:  python 07_num-6.py
#

def f(x):
    return 2 * x + 1

xs = [-2, -1, 0, 1, 2]
print([(x, f(x)) for x in xs])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [(-2, -3), (-1, -1), (0, 1), (1, 3), (2, 5)]
