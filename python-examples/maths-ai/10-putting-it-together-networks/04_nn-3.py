# -*- coding: utf-8 -*-
# ==========================================================================
# Logistic regression and the decision boundary [maths-ai / Putting it
# together: networks]
# ==========================================================================
# WHAT IT IS
# For yes/no answers, take the linear score z = w·x + b and squash it with a
# sigmoid to get a probability: P(yes) = σ(z). The decision boundary is where
# that probability is 0.5, i.e. z = 0. Training adjusts w and b with
# cross-entropy loss so the curve separates the classes.
#
# WHERE YOU USE IT
# Logistic regression is the simplest classifier and the final layer of many
# deep models.
#
# RUN IT:  python 04_nn-3.py
#

import math
sigmoid = lambda z: 1 / (1 + math.exp(-z))
w, b = 1.0, -4.0
for hours in [2, 4, 6]:
    print(hours, round(sigmoid(w * hours + b), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2 0.119
# 4 0.5
# 6 0.881
