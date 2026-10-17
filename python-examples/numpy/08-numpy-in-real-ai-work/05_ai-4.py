# -*- coding: utf-8 -*-
# ==========================================================================
# Softmax with temperature [numpy / NumPy in real AI work]
# ==========================================================================
# WHAT IT IS
# Softmax turns scores into probabilities: exp(z) / exp(z).sum(). Subtract the
# maximum first (z - z.max()) so exp cannot overflow. Dividing the scores by a
# temperature T before softmax changes how confident the result is: small T
# sharpens it toward one winner, large T flattens it toward equal chances.
#
# WHERE YOU USE IT
# Language models sample with a temperature; classifiers apply softmax to a
# whole batch with axis=1.
#
# RUN IT:  python 05_ai-4.py
#

import numpy as np

def softmax(z, T=1.0):
    z = np.asarray(z, dtype=float) / T
    e = np.exp(z - z.max())
    return e / e.sum()

print(np.round(softmax([2.0, 1.0, 0.1]), 3))
print(np.round(softmax([2.0, 1.0, 0.1], T=0.5), 3))
print(np.round(softmax([2.0, 1.0, 0.1], T=3), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.659 0.242 0.099]
# [0.864 0.117 0.019]
# [0.445 0.319 0.236]
