# -*- coding: utf-8 -*-
# ==========================================================================
# SGD, RMSprop and Adam on the same landscape [neural-networks / Optimisers]
# ==========================================================================
# WHAT IT IS
# All three start at (3.7, 3.5) on an illustrative stretched bowl, loss =
# ½(2x² + 0.2y²) — steep in x, shallow in y — with learning rate 0.15. SGD
# moves in proportion to the gradient, so it crawls along the shallow y
# direction. RMSprop and Adam normalise the step per parameter, so both
# directions progress at a similar pace. Step through the first 40 updates.
# This is a teaching landscape, not a claim about universal speed.
#
# WHERE YOU USE IT
# Which optimiser wins depends on the model, the data, scaling and tuning —
# compare on validation results.
#
# RUN IT:  python 05_opt-4.py
#

import numpy as np

grad = lambda p: np.array([2 * p[0], 0.2 * p[1]])
obj = lambda p: 0.5 * (2 * p[0] ** 2 + 0.2 * p[1] ** 2)
eta = 0.15
s = r = a = np.array([3.7, 3.5])
vr = np.zeros(2)
m, va = np.zeros(2), np.zeros(2)
for t in range(1, 41):
    s = s - eta * grad(s)
    g = grad(r)
    vr = 0.9 * vr + 0.1 * g * g
    r = r - eta * g / (np.sqrt(vr) + 1e-8)
    g = grad(a)
    m = 0.9 * m + 0.1 * g
    va = 0.999 * va + 0.001 * g * g
    a = a - eta * (m / (1 - 0.9 ** t)) / (np.sqrt(va / (1 - 0.999 ** t)) + 1e-8)
print(round(float(obj(s)), 3), round(float(obj(r)), 3), round(float(obj(a)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.107 0.0 0.111
