# -*- coding: utf-8 -*-
# ==========================================================================
# The derivative as a local slope [maths-ai / Calculus: change and slope]
# ==========================================================================
# WHAT IT IS
# The derivative f′(x) (or df/dx) is the slope of the curve at one exact point
# — the slope of the tangent line. For f(x) = x² it is 2x: shallow near 0,
# steeper further out. Positive: climbing. Negative: falling. Zero: a flat
# spot, perhaps a minimum.
#
# WHERE YOU USE IT
# Training a network means finding the bottom of the loss curve; the
# derivative is the signal that says which way is downhill.
#
# RUN IT:  python 02_calc-1.py
#

def derivative(f, x, h=1e-6):
    return (f(x + h) - f(x - h)) / (2 * h)

print(round(derivative(lambda x: x ** 2, 3), 4))
print(round(derivative(lambda x: x ** 3, 2), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 6.0
# 12.0
