# -*- coding: utf-8 -*-
# ==========================================================================
# The line y = wx + b [maths-ai / Straight lines and slope]
# ==========================================================================
# WHAT IT IS
# The most important equation to understand before a neural network: y = wx +
# b. The weight w is the slope — how steeply y changes with x. The bias b is
# the intercept — the value of y when x = 0 — and it slides the line up or
# down. A taxi that charges €3 to start and €2 per km has w = 2, b = 3.
#
# WHERE YOU USE IT
# A neuron's first step is exactly z = w·x + b. Training finds the w and b
# that make the line pass close to the data.
#
# RUN IT:  python 02_lin-1.py
#

def fare(km, w=2, b=3):
    return w * km + b

print(fare(0), fare(2), fare(5))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3 7 13
