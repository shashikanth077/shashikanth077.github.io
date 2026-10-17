# -*- coding: utf-8 -*-
# ==========================================================================
# Second derivative and curvature [maths-ai / Calculus: change and slope]
# ==========================================================================
# WHAT IT IS
# The second derivative is the slope of the slope: it tells you how the curve
# bends. Positive: curving up like a bowl (a minimum when the slope is 0).
# Negative: curving down (a maximum). Where the first derivative is zero but
# the second is not, you can tell a minimum from a maximum.
#
# WHERE YOU USE IT
# Curvature tells you how big a safe learning rate is, and why optimisers like
# Adam adapt the step size per weight.
#
# RUN IT:  python 08_calc-7.py
#

f = lambda x: x**3 - 3 * x
df = lambda x: 3 * x**2 - 3
d2f = lambda x: 6 * x
for x in [-1, 1]:
    print(x, f(x), df(x), "max" if d2f(x) < 0 else "min")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# -1 2 0 max
# 1 -2 0 min
